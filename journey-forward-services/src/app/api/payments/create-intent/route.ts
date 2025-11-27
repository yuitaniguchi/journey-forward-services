import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { bookingId, customerEmail } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 }
      );
    }

    // 本当は、既存の Customer を探して再利用するのがベスト。
    // ひとまずは毎回作成するシンプル版で OK。
    const customer = await stripe.customers.create({
      email: customerEmail,
      metadata: { bookingId },
    });

    // ここでは「カード登録用」の SetupIntent を作る
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      usage: "off_session",
      metadata: { bookingId },
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
    });
  } catch (error) {
    console.error("[create-intent] error:", error);
    return new NextResponse("Error creating intent", { status: 500 });
  }
}
