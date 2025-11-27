import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  // ひとまずログだけ
  console.log("Stripe webhook event:", event.type);

  return NextResponse.json({ received: true });
}

// Next.js App Router で raw body を扱うための設定（必要なら）
export const config = {
  api: {
    bodyParser: false,
  },
};
