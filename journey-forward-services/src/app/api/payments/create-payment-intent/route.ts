import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { requestId } = await req.json();

    // 1. requestId のバリデーション
    const numericRequestId = Number(requestId);
    if (!requestId || Number.isNaN(numericRequestId) || numericRequestId <= 0) {
      return NextResponse.json(
        { error: "requestId must be a positive number" },
        { status: 400 }
      );
    }

    console.log("[create-payment-intent] start. requestId =", numericRequestId);

    // 2. Payment レコードを取得（amount / stripeCustomerId / paymentMethod を使う）
    const payment = await prisma.payment.findUnique({
      where: { requestId: numericRequestId },
    });

    if (!payment) {
      console.error(
        "[create-payment-intent] Payment record not found for requestId",
        numericRequestId
      );
      return NextResponse.json(
        { error: "Payment record not found for this requestId" },
        { status: 404 }
      );
    }

    if (!payment.total) {
      console.error(
        "[create-payment-intent] total is missing in Payment record",
        payment
      );
      return NextResponse.json(
        { error: "Payment total amount is not set yet" },
        { status: 400 }
      );
    }

    if (!payment.stripeCustomerId) {
      console.error(
        "[create-payment-intent] stripeCustomerId is missing in Payment record",
        payment
      );
      return NextResponse.json(
        {
          error:
            "Stripe customer is not linked to this payment. Card might not be authorized yet.",
        },
        { status: 400 }
      );
    }

    if (!payment.paymentMethod) {
      console.error(
        "[create-payment-intent] paymentMethod is missing in Payment record",
        payment
      );
      return NextResponse.json(
        {
          error:
            "No saved card found for this payment. Please register a card before confirming payment.",
        },
        { status: 400 }
      );
    }

    // 3. 合計金額を cents に変換（例: 70.56 → 7056）
    const totalNumber = Number(payment.total); // 例: 70.56
    const amountInCents = Math.round(totalNumber * 100); // 7056

    if (!Number.isFinite(amountInCents) || amountInCents <= 0) {
      console.error(
        "[create-payment-intent] Invalid amountInCents",
        amountInCents
      );
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    const currency = payment.currency || "CAD";

    // 4. Stripe PaymentIntent を作成
    //   - automatic_payment_methods + allow_redirects: "never" で
    //     リダイレクト系の支払い方法を無効化（return_url 不要にする）
    //   - payment_method には保存済みカード (pm_xxx) を指定
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      customer: payment.stripeCustomerId,
      payment_method: payment.paymentMethod,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      // off_session はここでは指定しない（ユーザーの画面操作で支払う想定）
      confirm: false, // 実際の確定は /api/payments/confirm-payment 側で行う
      metadata: {
        requestId: String(numericRequestId),
      },
    });

    if (!paymentIntent.client_secret) {
      console.error(
        "[create-payment-intent] PaymentIntent created but client_secret is null",
        paymentIntent.id
      );
      return NextResponse.json(
        { error: "Failed to create payment intent" },
        { status: 500 }
      );
    }

    // DB の Payment レコードに PaymentIntent の ID を紐づけておく
    await prisma.payment.update({
      where: { requestId: numericRequestId },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        status: "REQUIRES_CONFIRMATION", // 「最終支払いの確定待ち」的な状態
      },
    });

    console.log(
      "[create-payment-intent] success. pi =",
      paymentIntent.id,
      "amount =",
      amountInCents,
      currency
    );

    // 5. フロントで必要なら client_secret を使えるように返す
    return NextResponse.json(
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[create-payment-intent] unexpected error:", error);
    return NextResponse.json(
      { error: "Error creating payment intent" },
      { status: 500 }
    );
  }
}
