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
      case "setup_intent.succeeded": {
        const setupIntent = event.data.object as Stripe.SetupIntent;
        // requestId を優先、互換のため bookingId も一応見る
        const requestIdRaw =
          setupIntent.metadata?.requestId ?? setupIntent.metadata?.bookingId;

        console.log("✅ setup_intent.succeeded, requestIdRaw:", requestIdRaw);

        if (!requestIdRaw) {
          console.warn("setup_intent.succeeded without requestId metadata");
          break;
        }

        const requestId = Number(requestIdRaw);
        if (Number.isNaN(requestId)) {
          console.warn("requestId is not a valid number:", requestIdRaw);
          break;
        }

        // Request が実在するか確認（Quotation は見に行かない！）
        const request = await prisma.request.findUnique({
          where: { id: requestId },
        });

        if (!request) {
          console.warn("Request not found for id:", requestId);
          break;
        }

        await prisma.payment.upsert({
          where: { requestId },
          create: {
            requestId,
            subtotal: new Prisma.Decimal(0),
            tax: new Prisma.Decimal(0),
            total: new Prisma.Decimal(0),
            currency: "CAD",
            status: "AUTHORIZED",
            stripeCustomerId:
              (setupIntent.customer as string | null | undefined) ?? null,
            paymentMethod: "card",
          },
          update: {
            stripeCustomerId:
              (setupIntent.customer as string | null | undefined) ?? null,
            paymentMethod: "card",
          },
        });

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
