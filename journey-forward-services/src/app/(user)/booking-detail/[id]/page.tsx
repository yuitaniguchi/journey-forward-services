import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BookingDetailClient from "./BookingDetailClient";
import type { BookingRequest } from "@/types/booking";

type PageParams = Promise<{ id: string }>;

type BookingDetailPageProps = {
  params: PageParams;
};

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const { id: token } = await params;

  const quotation = await prisma.quotation.findFirst({
    where: {
      bookingLink: {
        endsWith: token,
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

  return (
    <BookingDetailClient
      requestId={booking.id.toString()}
      initialBooking={formattedBooking}
    />
  );
}
