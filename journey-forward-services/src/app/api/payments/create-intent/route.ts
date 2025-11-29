import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { requestId, bookingId, customerEmail } = await req.json();

    // requestId を優先、なければ後方互換で bookingId を使う
    const effectiveRequestId = requestId ?? bookingId;

    if (!effectiveRequestId) {
      return NextResponse.json(
        { error: "requestId (or bookingId) is required" },
        { status: 400 }
      );
    }

    const requestIdStr = String(effectiveRequestId);

    // Stripe の Customer 作成（必要であれば既存 Customer 再利用にあとで変えてOK）
    const customer = await stripe.customers.create({
      email: customerEmail,
      metadata: {
        requestId: requestIdStr,
      },
    });

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      usage: "off_session",
      payment_method_types: ["card"],
      metadata: {
        requestId: requestIdStr, // ← webhook 側もこれを見る
      },
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
    });
  } catch (error) {
    console.error("[create-intent] error:", error);
    return new NextResponse("Error creating intent", { status: 500 });
  }
}
