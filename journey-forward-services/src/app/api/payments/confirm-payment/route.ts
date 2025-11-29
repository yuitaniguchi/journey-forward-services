// src/app/api/payments/confirm-payment/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { requestId } = await req.json();

    const numericRequestId = Number(requestId);
    if (!requestId || Number.isNaN(numericRequestId) || numericRequestId <= 0) {
      return NextResponse.json(
        { error: "requestId must be a positive number" },
        { status: 400 }
      );
    }

    console.log("[confirm-payment] start. requestId =", numericRequestId);

    const payment = await prisma.payment.findUnique({
      where: { requestId: numericRequestId },
    });

    if (!payment) {
      console.error(
        "[confirm-payment] Payment record not found for requestId",
        numericRequestId
      );
      return NextResponse.json(
        { error: "Payment record not found for this requestId" },
        { status: 404 }
      );
    }

    if (!payment.stripePaymentIntentId) {
      console.error(
        "[confirm-payment] stripePaymentIntentId is missing in Payment record",
        payment
      );
      return NextResponse.json(
        {
          error:
            "PaymentIntent is not created yet. Please create it before confirming payment.",
        },
        { status: 400 }
      );
    }

    // Stripe で PaymentIntent を confirm
    const paymentIntent = await stripe.paymentIntents.confirm(
      payment.stripePaymentIntentId
      // 必要ならここで { payment_method: "pm_xxx" } なども渡せる
    );

    console.log(
      "[confirm-payment] PaymentIntent confirmed:",
      paymentIntent.id,
      "status:",
      paymentIntent.status
    );

    // 本当の「支払い確定」は webhook (payment_intent.succeeded) で扱う想定。
    // ここではステータスを一時的に "PROCESSING" 的な文字列に更新しておいてもOK。
    await prisma.payment.update({
      where: { requestId: numericRequestId },
      data: {
        status: paymentIntent.status.toUpperCase(), // 例: "REQUIRES_CAPTURE" / "SUCCEEDED"
      },
    });

    return NextResponse.json(
      {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[confirm-payment] unexpected error:", error);
    return NextResponse.json(
      { error: "Error confirming payment" },
      { status: 500 }
    );
  }
}
