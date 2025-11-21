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
 * POST /api/bookings – public booking form
 *
 * いまフロントから飛んでくる body 例：
 * {
 *   customer: { firstName, lastName, email, phone },
 *   deliveryRequired: boolean,
 *   pickupPostalCode: string,
 *   pickupAddressLine1: string,
 *   pickupAddressLine2: string | null,
 *   pickupCity: string,
 *   pickupState: string,
 *   pickupFloor: number | null,
 *   pickupElevator: boolean,
 *   preferredDatetime: string,         // ISO
 *   freeCancellationDeadline: string,  // ISO
 *   status: "RECEIVED" | ...,
 *   items: [{ name, size, quantity }]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    console.log("POST /api/bookings body =", body);

    const {
      customer,
      deliveryRequired = false,

      pickupPostalCode,
      pickupAddressLine1,
      pickupAddressLine2,
      pickupCity,
      pickupState = "BC",
      pickupFloor,
      pickupElevator = false,

      preferredDatetime,
      freeCancellationDeadline,
      status = "RECEIVED",

      items = [],
    } = body ?? {};

    const { firstName, lastName, email, phone } = customer ?? {};

    // ---- バリデーション ----

    if (!pickupPostalCode || typeof pickupPostalCode !== "string") {
      return NextResponse.json(
        { error: "pickupPostalCode is required" },
        { status: 400 }
      );
    }

    if (!pickupAddressLine1 || typeof pickupAddressLine1 !== "string") {
      return NextResponse.json(
        { error: "pickupAddressLine1 is required" },
        { status: 400 }
      );
    }

    if (!pickupCity || typeof pickupCity !== "string") {
      return NextResponse.json(
        { error: "pickupCity is required" },
        { status: 400 }
      );
    }

    if (!preferredDatetime || typeof preferredDatetime !== "string") {
      return NextResponse.json(
        { error: "preferredDatetime is required" },
        { status: 400 }
      );
    }
    const preferredDt = new Date(preferredDatetime);
    if (Number.isNaN(preferredDt.getTime())) {
      return NextResponse.json(
        { error: "preferredDatetime must be a valid ISO date string" },
        { status: 400 }
      );
    }

    if (
      !freeCancellationDeadline ||
      typeof freeCancellationDeadline !== "string"
    ) {
      return NextResponse.json(
        { error: "freeCancellationDeadline is required" },
        { status: 400 }
      );
    }
    const freeCancelDt = new Date(freeCancellationDeadline);
    if (Number.isNaN(freeCancelDt.getTime())) {
      return NextResponse.json(
        { error: "freeCancellationDeadline must be a valid ISO date string" },
        { status: 400 }
      );
    }

    if (!firstName || typeof firstName !== "string") {
      return NextResponse.json(
        { error: "firstName is required" },
        { status: 400 }
      );
    }

    if (!lastName || typeof lastName !== "string") {
      return NextResponse.json(
        { error: "lastName is required" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "phone is required" }, { status: 400 });
    }

    if (!ALLOWED_STATUSES.includes(status as RequestStatus)) {
      return NextResponse.json(
        {
          error: `status must be one of: ${ALLOWED_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 24時間以上先チェック
    const diff = preferredDt.getTime() - Date.now();
    if (diff < 24 * 60 * 60 * 1000) {
      return NextResponse.json(
        { error: "pickup time must be at least 24 hours from now" },
        { status: 400 }
      );
    }

    // floor は number | null に整形
    let pickupFloorNum: number | null = null;
    if (typeof pickupFloor === "number") {
      pickupFloorNum = pickupFloor;
    } else if (typeof pickupFloor === "string" && pickupFloor.trim()) {
      const parsed = Number.parseInt(pickupFloor.trim(), 10);
      pickupFloorNum = Number.isNaN(parsed) ? null : parsed;
    }

    // ---- Customer を email で upsert ----
    const customerRecord = await prisma.customer.upsert({
      where: { email },
      update: { firstName, lastName, phone },
      create: { firstName, lastName, email, phone },
    });

    // ---- Request + Items を作成 ----
    const requestRecord = await prisma.request.create({
      data: {
        customerId: customerRecord.id,
        deliveryRequired,

        pickupPostalCode,
        pickupAddressLine1,
        pickupAddressLine2,
        pickupCity,
        pickupState,
        pickupFloor: pickupFloorNum,
        pickupElevator,

        deliveryPostalCode: null,
        deliveryAddressLine1: null,
        deliveryAddressLine2: null,
        deliveryCity: null,
        deliveryState: null,
        deliveryFloor: null,
        deliveryElevator: null,

        preferredDatetime: preferredDt,
        freeCancellationDeadline: freeCancelDt,
        status: status as RequestStatus,

        items: {
          create: (items as any[]).map((it) => ({
            name: it.name,
            size: it.size,
            quantity: it.quantity ?? 1,
          })),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json({ data: requestRecord }, { status: 201 });
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
