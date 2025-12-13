import React from "react";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import BookingConfirmClient from "./BookingConfirmClient";
import type { BookingRequest } from "@/types/booking";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function BookingConfirmPage({ params }: PageProps) {
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
          quotation: {
            include: {
              discountCode: true,
            },
          },
          payment: true,
        },
      },
    },
  });

  if (!quotation || !quotation.request) {
    return notFound();
  }

  const booking = quotation.request;

  if (
    booking.status === "CONFIRMED" ||
    booking.status === "INVOICED" ||
    booking.status === "PAID"
  ) {
    redirect(`/booking/${token}/dashboard`);
  }

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
      discountAmount: booking.quotation!.discountAmount
        ? Number(booking.quotation!.discountAmount)
        : null,
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

  let clientSecret = "";
  try {
    let payment = await prisma.payment.findUnique({
      where: { requestId: booking.id },
    });

    if (!payment || !payment.stripeCustomerId) {
      let stripeCustomerId = payment?.stripeCustomerId;

      if (!stripeCustomerId) {
        const stripeCustomer = await stripe.customers.create({
          email: booking.customer.email,
          name: `${booking.customer.firstName} ${booking.customer.lastName}`,
          phone: booking.customer.phone || undefined,
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
  }

  return (
    <BookingConfirmClient
      booking={formattedBooking}
      token={token}
      clientSecret={clientSecret}
    />
  );
}
