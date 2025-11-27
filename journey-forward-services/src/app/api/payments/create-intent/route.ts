import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();

    // TODO: bookingId から金額や顧客情報を取得する

    const setupIntent = await stripe.setupIntents.create({
      usage: "off_session",
      metadata: { bookingId },
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error creating intent", { status: 500 });
  }
}
