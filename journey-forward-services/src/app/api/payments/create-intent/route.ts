import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma"; // ★ 追加
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { requestId, bookingId, customerEmail } = await req.json();

    const effectiveRequestId = requestId ?? bookingId;

    if (!effectiveRequestId) {
      return NextResponse.json(
        { error: "requestId (or bookingId) is required" },
        { status: 400 }
      );
    }

    const requestIdNum = Number(effectiveRequestId);
    const requestIdStr = String(effectiveRequestId);

    const customer = await stripe.customers.create({
      email: customerEmail,
      metadata: {
        requestId: requestIdStr,
      },
    });

    await prisma.payment.upsert({
      where: { requestId: requestIdNum },
      update: {
        stripeCustomerId: customer.id,
      },
      create: {
        requestId: requestIdNum,
        stripeCustomerId: customer.id,
        status: "PENDING",
        subtotal: 0,
        tax: 0,
        total: 0,
      },
    });

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      usage: "off_session",
      payment_method_types: ["card"],
      metadata: {
        requestId: requestIdStr,
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