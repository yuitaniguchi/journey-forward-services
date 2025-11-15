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

type RouteParams = Promise<{ id: string }>;

function parseId(paramId: string) {
  const id = Number(paramId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const { id: rawId } = await params; //
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

    return NextResponse.json({ data: booking }, { status: 200 });
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
