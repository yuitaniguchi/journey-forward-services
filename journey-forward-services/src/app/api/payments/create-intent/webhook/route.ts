// src/app/api/payments/create-intent/route.ts
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body?.bookingId) {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 }
      );
    }

    const { bookingId, customerEmail } = body;

    // 環境変数チェック（足りないときにすぐ気づけるように）
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY is not set" },
        { status: 500 }
      );
    }

    // とりあえずシンプルな Customer 作成
    const customer = await stripe.customers.create({
      email: customerEmail ?? undefined,
      metadata: { bookingId },
    });

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      usage: "off_session",
      metadata: { bookingId },
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
    });
  } catch (err: any) {
    console.error("[create-intent] error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
