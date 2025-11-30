// src/app/api/bookings/[id]/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = Promise<{ id: string }>;

function parseId(paramId: string) {
  const id = Number(paramId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

// 24時間以内のキャンセル料（CAD）
const CANCELLATION_FEE = 25;

export async function POST(
  _request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);

    if (id === null) {
      return NextResponse.json(
        { error: "Invalid id. id must be a positive integer." },
        { status: 400 }
      );
    }

    console.log("[cancel] start. requestId =", id);

    // 予約 + 支払い + 顧客 情報を取得
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        payment: true,
        customer: true,
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // すでにキャンセル済みなら不可
    if (request.status === "CANCELLED") {
      return NextResponse.json(
        { error: "This booking is already cancelled." },
        { status: 400 }
      );
    }

    const now = new Date();
    const pickupTime = new Date(request.preferredDatetime);
    const freeDeadline = request.freeCancellationDeadline
      ? new Date(request.freeCancellationDeadline)
      : null;

    // ピックアップ時間を過ぎていたらキャンセル不可
    if (now >= pickupTime) {
      return NextResponse.json(
        {
          error:
            "This booking can no longer be cancelled because the pickup time has already passed.",
        },
        { status: 400 }
      );
    }

    // ===== FREE CANCELLATION =====
    if (freeDeadline && now <= freeDeadline) {
      const updated = await prisma.request.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: now,
          cancellationFee: null,
        },
      });

      console.log("[cancel] FREE cancellation completed. requestId =", id);

      return NextResponse.json(
        {
          cancellationType: "FREE",
          feeAmount: 0,
          request: updated,
        },
        { status: 200 }
      );
    }

    // ===== PAID CANCELLATION (within 24h) =====
    const payment = request.payment;

    if (!payment || !payment.stripeCustomerId || !payment.paymentMethod) {
      console.error(
        "[cancel] Missing payment info for requestId =",
        id,
        payment
      );
      return NextResponse.json(
        {
          error:
            "Cannot charge cancellation fee because payment information is missing.",
        },
        { status: 400 }
      );
    }

    const currency = payment.currency || "CAD";
    const feeAmountInCents = Math.round(CANCELLATION_FEE * 100); // 25 CAD → 2500

    console.log(
      "[cancel] charging cancellation fee via Stripe. requestId=",
      id,
      "amount=",
      feeAmountInCents,
      currency
    );

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: feeAmountInCents,
        currency,
        customer: payment.stripeCustomerId,
        payment_method: payment.paymentMethod,
        off_session: true,
        confirm: true,
        // 👇 自動決済メソッドは使わず card 固定
        payment_method_types: ["card"],
        metadata: {
          requestId: String(request.id),
          cancellationType: "PAID",
        },
      });

      console.log(
        "[cancel] PaymentIntent for cancellation fee succeeded:",
        paymentIntent.id
      );

      // Request を CANCELLED + fee 付きに更新
      const updatedRequest = await prisma.request.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: now,
          cancellationFee: CANCELLATION_FEE,
        },
      });

      // Payment レコードも更新（任意のステータス文字列でOK）
      await prisma.payment.update({
        where: { requestId: id },
        data: {
          status: "CANCELLATION_FEE_CHARGED",
          stripePaymentIntentId: paymentIntent.id,
        },
      });

      console.log(
        "[cancel] PAID cancellation completed. requestId =",
        id,
        "paymentIntentId =",
        paymentIntent.id
      );

      return NextResponse.json(
        {
          cancellationType: "PAID",
          feeAmount: CANCELLATION_FEE,
          stripePaymentIntentId: paymentIntent.id,
          request: updatedRequest,
        },
        { status: 200 }
      );
    } catch (err: any) {
      console.error("[cancel] Error while charging cancellation fee:", err);
      return NextResponse.json(
        {
          error:
            "An error occurred while processing the cancellation fee. Please try again or contact support.",
        },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("[cancel] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
