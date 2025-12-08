import React from "react";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe"; // Stripeライブラリをインポート
import BookingConfirmClient from "./BookingConfirmClient";
import type { BookingRequest } from "@/types/booking";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function BookingConfirmPage({ params }: PageProps) {
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

  // 2. 既に確定済みならダッシュボードへリダイレクト
  if (
    booking.status === "CONFIRMED" ||
    booking.status === "INVOICED" ||
    booking.status === "PAID"
  ) {
    redirect(`/booking/${token}/dashboard`);
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

  // 4. Stripe SetupIntent の事前作成 (サーバーサイドで実行)
  let clientSecret = "";
  try {
    // 4-1. Paymentレコードの確保
    let payment = await prisma.payment.findUnique({
      where: { requestId: booking.id },
    });

    // Paymentがなければ作成、CustomerIdがなければStripeで作成
    if (!payment || !payment.stripeCustomerId) {
      let stripeCustomerId = payment?.stripeCustomerId;

      if (!stripeCustomerId) {
        const stripeCustomer = await stripe.customers.create({
          email: booking.customer.email,
          metadata: {
            requestId: String(booking.id),
          },
        });
        stripeCustomerId = stripeCustomer.id;
      }

      payment = await prisma.payment.upsert({
        where: { requestId: booking.id },
        update: { stripeCustomerId },
        create: {
          requestId: booking.id,
          stripeCustomerId,
          status: "PENDING",
          subtotal: 0,
          tax: 0,
          total: 0,
          currency: "CAD",
        },
      });
    }

    // 4-2. SetupIntent 作成
    const setupIntent = await stripe.setupIntents.create({
      customer: payment.stripeCustomerId!,
      usage: "off_session",
      payment_method_types: ["card"],
      metadata: {
        requestId: String(booking.id),
      },
    });

    if (setupIntent.client_secret) {
      clientSecret = setupIntent.client_secret;
    }
  } catch (error) {
    console.error("Failed to setup Stripe intent on server:", error);
    // エラー時はクライアント側でハンドリングするか、エラーページを出す
    // 今回はclientSecretが空文字になるので、Client側でエラー表示が出る
  }

  // 5. クライアントコンポーネントへ渡す
  return (
    <BookingConfirmClient
      booking={formattedBooking}
      token={token}
      clientSecret={clientSecret}
    />
  );
}
