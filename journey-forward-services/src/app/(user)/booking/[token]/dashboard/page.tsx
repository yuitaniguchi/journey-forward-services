import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BookingDetailClient from "./BookingDetailClient";
import type { BookingRequest } from "@/types/booking";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function BookingDashboardPage({ params }: PageProps) {
  const { token } = await params;

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
      subtotal:
        Number(booking.quotation!.originalSubtotal) > 0
          ? Number(booking.quotation!.originalSubtotal)
          : Number(booking.quotation!.subtotal),

      tax: Number(booking.quotation!.tax),
      total: Number(booking.quotation!.total),

      discountAmount: booking.quotation!.discountAmount
        ? Number(booking.quotation!.discountAmount)
        : 0,
    },
    payment: booking.payment
      ? {
          ...booking.payment,
          subtotal: Number(booking.payment.subtotal),
          tax: Number(booking.payment.tax),
          total: Number(booking.payment.total),
          discountAmount: booking.payment.discountAmount
            ? Number(booking.payment.discountAmount)
            : 0,
        }
      : null,
  };

  return (
    <BookingDetailClient
      requestId={booking.id.toString()}
      token={token}
      initialBooking={formattedBooking}
    />
  );
}
