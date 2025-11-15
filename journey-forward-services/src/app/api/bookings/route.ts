import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RequestStatus } from "@prisma/client";

const ALLOWED_STATUSES: RequestStatus[] = [
  "RECEIVED",
  "QUOTED",
  "CONFIRMED",
  "INVOICED",
  "PAID",
  "CANCELLED",
];

/**
 * GET /api/bookings – Admin
 */
export async function GET() {
  try {
    const bookings = await prisma.request.findMany({
      orderBy: { id: "desc" },
      include: {
        customer: true,
        quotation: true,
        payment: true,
      },
    });

    return NextResponse.json({ data: bookings }, { status: 200 });
  } catch (err) {
    console.error("GET /api/bookings error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookings – new booking request
 */
export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      customerId,
      deliveryRequired = false,

      pickupPostalCode,
      pickupAddressLine1,
      pickupAddressLine2,
      pickupCity,
      pickupState = "BC",
      pickupFloor,
      pickupElevator,

      deliveryPostalCode,
      deliveryAddressLine1,
      deliveryAddressLine2,
      deliveryCity,
      deliveryState,
      deliveryFloor,
      deliveryElevator,

      preferredDatetime,
      freeCancellationDeadline,
      status = "RECEIVED",
    } = body ?? {};

    // customerId
    if (
      typeof customerId !== "number" ||
      !Number.isInteger(customerId) ||
      customerId <= 0
    ) {
      return NextResponse.json(
        { error: "customerId must be a positive integer" },
        { status: 400 }
      );
    }

    // pickup
    if (!pickupPostalCode || typeof pickupPostalCode !== "string") {
      return NextResponse.json(
        { error: "pickupPostalCode is required and must be a string" },
        { status: 400 }
      );
    }
    if (!pickupAddressLine1 || typeof pickupAddressLine1 !== "string") {
      return NextResponse.json(
        { error: "pickupAddressLine1 is required and must be a string" },
        { status: 400 }
      );
    }
    if (!pickupCity || typeof pickupCity !== "string") {
      return NextResponse.json(
        { error: "pickupCity is required and must be a string" },
        { status: 400 }
      );
    }

    const preferredDt = new Date(preferredDatetime);
    if (!preferredDatetime || Number.isNaN(preferredDt.getTime())) {
      return NextResponse.json(
        { error: "preferredDatetime must be a valid ISO date string" },
        { status: 400 }
      );
    }

    const freeCancelDt = new Date(freeCancellationDeadline);
    if (!freeCancellationDeadline || Number.isNaN(freeCancelDt.getTime())) {
      return NextResponse.json(
        {
          error: "freeCancellationDeadline must be a valid ISO date string",
        },
        { status: 400 }
      );
    }

    // status
    if (!ALLOWED_STATUSES.includes(status as RequestStatus)) {
      return NextResponse.json(
        {
          error: `status must be one of: ${ALLOWED_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (deliveryRequired) {
      if (!deliveryPostalCode || !deliveryAddressLine1 || !deliveryCity) {
        return NextResponse.json(
          {
            error:
              "When deliveryRequired is true, deliveryPostalCode, deliveryAddressLine1, and deliveryCity are required",
          },
          { status: 400 }
        );
      }
    }

    const booking = await prisma.request.create({
      data: {
        customerId,
        deliveryRequired,

        pickupPostalCode,
        pickupAddressLine1,
        pickupAddressLine2,
        pickupCity,
        pickupState,
        pickupFloor,
        pickupElevator,

        deliveryPostalCode,
        deliveryAddressLine1,
        deliveryAddressLine2,
        deliveryCity,
        deliveryState,
        deliveryFloor,
        deliveryElevator,

        preferredDatetime: preferredDt,
        freeCancellationDeadline: freeCancelDt,
        status: status as RequestStatus,
      },
    });

    return NextResponse.json({ data: booking }, { status: 201 });
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
