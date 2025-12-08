import React from "react";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import BookingPayClient from "./BookingPayClient";
import type { BookingRequest } from "@/types/booking";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function FinalPaymentPage({ params }: PageProps) {
  const { token } = await params;

  // 1. トークンで予約を取得
  const quotation = await prisma.quotation.findFirst({
    where: {
      bookingLink: {
        contains: token,
      },
    },
    include: {
      request: {
        include: {
          customer: true,
          items: true,
          quotation: true,
          payment: true,
        },
      },
    },
  });

  if (!quotation || !quotation.request) {
    return notFound();
  }

  const booking = quotation.request;

  // 2. 支払い済みならレシートへリダイレクト
  if (booking.status === "PAID") {
    redirect(`/booking/${token}/receipt`);
  }

  // 3. データの整形
  const formattedBooking: BookingRequest = {
    ...booking,
    preferredDatetime: booking.preferredDatetime.toISOString(),
    freeCancellationDeadline: booking.freeCancellationDeadline.toISOString(),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    cancelledAt: booking.cancelledAt?.toISOString() || null,
    cancellationFee: booking.cancellationFee
      ? Number(booking.cancellationFee)
      : null,
    pickupFloor: booking.pickupFloor,
    deliveryFloor: booking.deliveryFloor,

    customer: {
      ...booking.customer,
      phone: booking.customer.phone || null,
    },
    items: booking.items.map((item) => ({
      ...item,
      photoUrl: item.photoUrl || undefined,
    })),
    quotation: {
      ...booking.quotation!,
      subtotal: Number(booking.quotation!.subtotal),
      tax: Number(booking.quotation!.tax),
      total: Number(booking.quotation!.total),
    },
    payment: booking.payment
      ? {
          ...booking.payment,
          subtotal: Number(booking.payment.subtotal),
          tax: Number(booking.payment.tax),
          total: Number(booking.payment.total),
        }
      : null,
  };

  // 4. Stripe PaymentIntent の準備 (Server Side)
  // 画面表示前に裏でIntentを作っておくことで、ボタンを押した時に即決済できるようにする
  let serverError: string | undefined = undefined;

  try {
    const payment = booking.payment;

    if (!payment || !payment.total) {
      serverError = "Payment details are missing.";
    } else if (!payment.stripeCustomerId || !payment.paymentMethod) {
      serverError =
        "Credit card information not found. Please contact support.";
    } else {
      const currency = payment.currency || "CAD";
      const amountInCents = Math.round(Number(payment.total) * 100);

      // PaymentIntentを作成
      // (confirm: false で作成し、クライアントからのリクエストで confirm する)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        customer: payment.stripeCustomerId,
        payment_method: payment.paymentMethod,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never",
        },
        confirm: false,
        metadata: {
          requestId: String(booking.id),
        },
      });

      if (paymentIntent.id) {
        // DBにIntent IDを保存
        await prisma.payment.update({
          where: { requestId: booking.id },
          data: {
            stripePaymentIntentId: paymentIntent.id,
          },
        });
      } else {
        serverError = "Failed to create payment intent.";
      }
    }
  } catch (error) {
    console.error("Stripe setup error on server:", error);
    serverError = "An error occurred while preparing payment.";
  }

  return (
    <BookingPayClient
      booking={formattedBooking}
      token={token}
      serverError={serverError}
    />
  );
}
