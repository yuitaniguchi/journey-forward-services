// src/app/api/admin/payments/[id]/finalize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RequestStatus } from "@prisma/client";

function parseId(paramId: string) {
  const id = Number(paramId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

// ✅ このプロジェクトのパターンに合わせて Promise 型にする
type RouteParams = Promise<{ id: string }>;

export async function POST(
  req: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    // ✅ params は Promise なので await してから id を取り出す
    const { id: rawId } = await params;
    const requestId = parseId(rawId);

    if (requestId === null) {
      return NextResponse.json(
        { error: "Invalid id. id must be a positive integer." },
        { status: 400 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { subtotal, tax, total, currency } = (body ?? {}) as {
      subtotal?: unknown;
      tax?: unknown;
      total?: unknown;
      currency?: unknown;
    };

    // ---- バリデーション ----
    if (
      !isNonNegativeNumber(subtotal) ||
      !isNonNegativeNumber(tax) ||
      !isNonNegativeNumber(total)
    ) {
      return NextResponse.json(
        {
          error:
            "subtotal, tax, and total are required and must be non-negative numbers.",
        },
        { status: 400 }
      );
    }

    // total ≒ subtotal + tax をチェック（浮動小数の誤差を許容）
    const expectedTotal = subtotal + tax;
    const diff = Math.abs(expectedTotal - total);
    const TOLERANCE = 0.01; // $0.01 まで誤差を許容

    if (diff > TOLERANCE) {
      return NextResponse.json(
        {
          error:
            "total must be approximately equal to subtotal + tax (within tolerance).",
          detail: {
            subtotal,
            tax,
            total,
            expectedTotal,
            diff,
          },
        },
        { status: 400 }
      );
    }

    let currencyCode = "CAD";
    if (typeof currency === "string") {
      const trimmed = currency.trim();
      if (trimmed.length === 0) {
        return NextResponse.json(
          { error: "currency, if provided, must be a non-empty string." },
          { status: 400 }
        );
      }
      currencyCode = trimmed.toUpperCase();
    }

    // ---- Request が存在するかチェック ----
    const existingRequest = await prisma.request.findUnique({
      where: { id: requestId },
      select: { id: true, status: true },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // （必要なら）Cancelled のときは弾く
    if (existingRequest.status === "CANCELLED") {
      return NextResponse.json(
        {
          error: "Cannot finalize payment for a cancelled request.",
        },
        { status: 400 }
      );
    }

    // ---- Payment を upsert ----
    const PAYMENT_STATUS_READY_FOR_PAYMENT = "READY_FOR_PAYMENT";

    const payment = await prisma.payment.upsert({
      where: { requestId },
      create: {
        requestId,
        subtotal,
        tax,
        total,
        currency: currencyCode,
        status: PAYMENT_STATUS_READY_FOR_PAYMENT,
      },
      update: {
        subtotal,
        tax,
        total,
        currency: currencyCode,
        status: PAYMENT_STATUS_READY_FOR_PAYMENT,
      },
    });

    // ---- Request.status を INVOICED に更新 ----
    const INVOICED_STATUS: RequestStatus = "INVOICED";

    await prisma.request.update({
      where: { id: requestId },
      data: { status: INVOICED_STATUS },
    });

    // ---- 将来のメール送信フック ----
    // Invoiced: Customer receives an invoice email with a unique booking link.
    // TODO: Send "Final quote & payment link" email to customer.
    // - Include final amount (subtotal, tax, total)
    // - Include link to `/final-payment/${requestId}`

    return NextResponse.json({ payment }, { status: 200 });
  } catch (err) {
    console.error("POST /api/admin/payments/[id]/finalize error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
