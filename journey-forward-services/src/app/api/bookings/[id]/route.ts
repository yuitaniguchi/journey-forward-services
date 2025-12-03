import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RequestStatus } from "@prisma/client";
import type { BookingRequest, BookingResponse } from "@/types/booking";

const ALLOWED_STATUSES: RequestStatus[] = [
  "RECEIVED",
  "QUOTED",
  "CONFIRMED",
  "INVOICED",
  "PAID",
  "CANCELLED",
];

type RouteParams = Promise<{ id: string }>;

function parseId(paramId: string) {
  const id = Number(paramId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

/**
 * GET /api/bookings/[id]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const { id: rawId } = await params;
    console.log("GET /api/bookings/[id] rawId =", rawId);

    const id = parseId(rawId);
    if (id === null) {
      return NextResponse.json(
        { error: "Invalid id. id must be a positive integer." },
        { status: 400 }
      );
    }

    const booking = await prisma.request.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        quotation: true,
        payment: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Decimal → number / Date → string に整形
    const quotation = booking.quotation
      ? {
          id: booking.quotation.id,
          subtotal: Number(booking.quotation.subtotal),
          tax: Number(booking.quotation.tax),
          total: Number(booking.quotation.total),
          bookingLink: booking.quotation.bookingLink,
        }
      : null;

    const payment = booking.payment
      ? {
          id: booking.payment.id,
          subtotal: Number(booking.payment.subtotal),
          tax: Number(booking.payment.tax),
          total: Number(booking.payment.total),
          currency: booking.payment.currency,
          status: booking.payment.status,
        }
      : null;

    const items = booking.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      size: item.size,
      quantity: item.quantity,
      photoUrl: item.photoUrl,
    }));

    const data: BookingRequest = {
      id: booking.id,
      customerId: booking.customerId,
      deliveryRequired: booking.deliveryRequired,

      pickupPostalCode: booking.pickupPostalCode,
      pickupAddressLine1: booking.pickupAddressLine1,
      pickupAddressLine2: booking.pickupAddressLine2,
      pickupCity: booking.pickupCity,
      pickupState: booking.pickupState,
      pickupFloor: booking.pickupFloor,
      pickupElevator: booking.pickupElevator,

      deliveryPostalCode: booking.deliveryPostalCode,
      deliveryAddressLine1: booking.deliveryAddressLine1,
      deliveryAddressLine2: booking.deliveryAddressLine2,
      deliveryCity: booking.deliveryCity,
      deliveryState: booking.deliveryState,
      deliveryFloor: booking.deliveryFloor,
      deliveryElevator: booking.deliveryElevator,

      preferredDatetime: booking.preferredDatetime.toISOString(),
      status: booking.status,

      freeCancellationDeadline: booking.freeCancellationDeadline.toISOString(),
      cancelledAt: booking.cancelledAt
        ? booking.cancelledAt.toISOString()
        : null,
      cancellationFee: booking.cancellationFee
        ? Number(booking.cancellationFee)
        : null,

      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),

      customer: {
        id: booking.customer.id,
        firstName: booking.customer.firstName,
        lastName: booking.customer.lastName,
        email: booking.customer.email,
        phone: booking.customer.phone ?? null,
      },

      items,
      quotation,
      payment,
    };

    return NextResponse.json<BookingResponse>({ data }, { status: 200 });
  } catch (err) {
    console.error("GET /api/bookings/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/bookings/[id]
 */
export async function PUT(
  request: NextRequest,
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

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { status } = body ?? {};

    if (!status || typeof status !== "string") {
      return NextResponse.json(
        { error: "status is required and must be a string" },
        { status: 400 }
      );
    }

    if (!ALLOWED_STATUSES.includes(status as RequestStatus)) {
      return NextResponse.json(
        {
          error: `status must be one of: ${ALLOWED_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.request.update({
      where: { id },
      data: { status: status as RequestStatus },
    });

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    console.error("PUT /api/bookings/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bookings/[id]
 */
export async function DELETE(
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

    await prisma.request.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    console.error("DELETE /api/bookings/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
