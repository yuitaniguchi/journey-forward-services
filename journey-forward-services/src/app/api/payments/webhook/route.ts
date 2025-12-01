import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { Prisma, RequestStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  console.log("🔥 Webhook route HIT");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return new NextResponse("Webhook secret missing", { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("Missing stripe-signature header");
    return new NextResponse("Bad Request", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log("📩 Stripe webhook event received:", event.type);

  try {
    switch (event.type) {
      /**
       * ① カード登録（SetupIntent 成功）
       * - metadata.bookingId は Quotation.bookingLink として扱う
       * - Quotation → Request を辿って requestId を取得
       * - Payment を upsert
       */
      // src/app/api/payments/webhook/route.ts の switch(event.type) の中

      case "setup_intent.succeeded": {
        const setupIntent = event.data.object as Stripe.SetupIntent;

        const requestIdRaw = setupIntent.metadata?.requestId;
        const requestId = requestIdRaw ? Number(requestIdRaw) : NaN;

        const stripeCustomerId = setupIntent.customer as string | null;
        const paymentMethodId = setupIntent.payment_method as string | null;

        console.log(
          "✅ setup_intent.succeeded:",
          "requestId =",
          requestIdRaw,
          "customer =",
          stripeCustomerId,
          "pm =",
          paymentMethodId
        );

        if (!requestIdRaw || Number.isNaN(requestId)) {
          console.warn(
            "setup_intent.succeeded triggered without valid requestId metadata"
          );
          break;
        }

        // Payment レコードが既にある前提で更新だけするパターン
        try {
          await prisma.payment.update({
            where: { requestId },
            data: {
              stripeCustomerId: stripeCustomerId ?? undefined,
              paymentMethod: paymentMethodId ?? undefined,
              status: "AUTHORIZED", // カードがオーソライズ済
            },
          });

          console.log(
            "💾 Payment updated on setup_intent.succeeded for requestId",
            requestId
          );
        } catch (err: any) {
          console.error(
            "Failed to update Payment on setup_intent.succeeded for requestId",
            requestId,
            err
          );
        }

        break;
      }

      // ここは将来の本決済（PaymentIntent）のときに使う想定なので、
      // いったんログだけにしておいてもOK
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("✅ payment_intent.succeeded:", paymentIntent.id);
        break;
      }

      case "setup_intent.created": {
        const setupIntent = event.data.object as Stripe.SetupIntent;
        console.log("ℹ️ setup_intent.created:", setupIntent.id);
        break;
      }

      default: {
        console.log(`Unhandled event type ${event.type}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new NextResponse("Webhook handler error", { status: 500 });
  }
}
