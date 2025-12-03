// src/app/api/admin/quotations/[id]/route.ts
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

// Next.js App Router の dynamic API は params が Promise になっているパターン
type RouteParams = Promise<{ id: string }>;

export async function POST(
  req: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    // params は Promise なので await してから id を取り出す
    const { id: rawId } = await params;
    const requestId = parseId(rawId);

    if (requestId === null) {
      return NextResponse.json(
        { error: "Invalid id. id must be a positive integer." },
        { status: 400 }
      );
    }

    // ---- body のパース ----
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { subtotal, tax, total, sendEmail } = (body ?? {}) as {
      subtotal?: unknown;
      tax?: unknown;
      total?: unknown;
      sendEmail?: unknown;
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

    // total ≒ subtotal + tax をチェック（浮動小数誤差を少し許容）
    const expectedTotal = subtotal + tax;
    const diff = Math.abs(expectedTotal - total);
    const TOLERANCE = 0.01;

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

    if (sendEmail !== undefined && typeof sendEmail !== "boolean") {
      return NextResponse.json(
        { error: "sendEmail must be a boolean if provided." },
        { status: 400 }
      );
    }

    // ---- Request が存在するかチェック ----
    const existingRequest = await prisma.request.findUnique({
      where: { id: requestId },
      select: { id: true, status: true },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (existingRequest.status === "CANCELLED") {
      return NextResponse.json(
        {
          error: "Cannot create/update quotation for a cancelled request.",
        },
        { status: 400 }
      );
    }

    // ---- Quotation を upsert ----
    // 既存レコードがあれば bookingLink はそのまま、
    // 無ければ新しく発行するイメージ
    const quotation = await prisma.quotation.upsert({
      where: { requestId },
      create: {
        requestId,
        subtotal,
        tax,
        total,
        bookingLink: crypto.randomUUID(), // 後で別の形式にしたくなったらここを変更
      },
      update: {
        subtotal,
        tax,
        total,
        // bookingLink は変更しない
      },
    });

    // ---- Request.status を QUOTED に更新（必要に応じて）----
    // 仕様：
    // - The company creates a quotation and sends it to the customer → Quoted
    // 一旦、RECEIVED / QUOTED のときだけ QUOTED に揃える
    if (
      existingRequest.status === "RECEIVED" ||
      existingRequest.status === "QUOTED"
    ) {
      const QUOTED_STATUS: RequestStatus = "QUOTED";
      await prisma.request.update({
        where: { id: requestId },
        data: { status: QUOTED_STATUS },
      });
    }

    // ---- メール送信フック（実装は別チケット）----
    // TODO: Send quotation email to customer when sendEmail === true.
    // - Include subtotal, tax, total
    // - Include quotation.bookingLink in the URL for /booking/booking-confirmation/[requestId]

    return NextResponse.json({ quotation }, { status: 200 });
  } catch (err) {
    console.error("POST /api/admin/quotations/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
