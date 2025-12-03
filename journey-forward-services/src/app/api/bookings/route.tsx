import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RequestStatus } from "@prisma/client";
import sgMail from "@sendgrid/mail";
import { render } from "@react-email/render";
import AutoConfirmationCustomer from "@/emails/AutoConfirmationCustomer";
import AutoConfirmationAdmin from "@/emails/AutoConfirmationAdmin"; // ★ 追加

const ALLOWED_STATUSES: RequestStatus[] = [
  "RECEIVED",
  "QUOTED",
  "CONFIRMED",
  "INVOICED",
  "PAID",
  "CANCELLED",
];

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
      return NextResponse.json({ error: "pickupPostalCode is required" }, { status: 400 });
    }
    if (!pickupAddressLine1 || typeof pickupAddressLine1 !== "string") {
      return NextResponse.json({ error: "pickupAddressLine1 is required" }, { status: 400 });
    }
    if (!pickupCity || typeof pickupCity !== "string") {
      return NextResponse.json({ error: "pickupCity is required" }, { status: 400 });
    }
    if (!preferredDatetime || typeof preferredDatetime !== "string") {
      return NextResponse.json({ error: "preferredDatetime is required" }, { status: 400 });
    }
    if (!firstName || typeof firstName !== "string") {
      return NextResponse.json({ error: "firstName is required" }, { status: 400 });
    }
    if (!lastName || typeof lastName !== "string") {
      return NextResponse.json({ error: "lastName is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const preferredDt = new Date(preferredDatetime);
    const freeCancelDt = new Date(freeCancellationDeadline);

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

        preferredDatetime: preferredDt,
        freeCancellationDeadline: freeCancelDt,
        status: status as RequestStatus,

        items: {
          create: (items as any[]).map((it) => ({
            name: it.name,
            size: it.size,
            quantity: it.quantity ?? 1,
            description: it.description || null,
            photoUrl: it.photoUrl || null,
          })),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    // ---- ★ SendGrid メール送信処理 (React Email対応版) ----
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    const adminEmail = process.env.ADMIN_EMAIL;

    console.log("📧 Debug Email Settings:", {
      from: fromEmail,
      to_admin: adminEmail
    });

    if (apiKey && fromEmail && adminEmail) {
      sgMail.setApiKey(apiKey);

      const requestData = {
        requestId: requestRecord.id.toString(),
        pickupAddress: `${pickupAddressLine1} ${pickupAddressLine2 || ""} ${pickupCity}, ${pickupPostalCode}`,
        deliveryAddress: deliveryRequired ? "Delivery Requested" : null,
        pickupFloor: pickupFloorNum || 0,
        pickupElevator: pickupElevator,
        items: requestRecord.items.map((item) => ({
          name: item.name,
          size: item.size,
          quantity: item.quantity,
        })),
      };

      const customerData = {
        firstName,
        lastName,
        email,
        phone,
      };

      const dateStr = preferredDt.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // 1. カスタマー用メール HTML生成
      const customerHtml = await render(
        <AutoConfirmationCustomer
          customer={ customerData }
          request = { requestData }
          requestDate = { dateStr }
        />
      );

      // 2. 管理者用メール HTML生成 (★ここを追加)
      // AutoConfirmationAdminも同様のPropsを受け取ると仮定しています
      const adminHtml = await render(
        <AutoConfirmationAdmin
          customer={ customerData }
          request = { requestData }
          requestDate = { dateStr }
        />
      );

      const msgToCustomer = {
        to: email,
        from: fromEmail,
        subject: `We received your request #${requestRecord.id} - Journey Forward Services`,
        html: customerHtml,
      };

      const msgToAdmin = {
        to: adminEmail,
        from: fromEmail,
        subject: `[New Request] #${requestRecord.id} from ${firstName} ${lastName}`,
        html: adminHtml, // ★ ここを生成したHTMLに差し替え
      };

      // 送信実行
      Promise.all([sgMail.send(msgToAdmin), sgMail.send(msgToCustomer)])
        .then(() => console.log("Emails sent successfully with React Email"))
        .catch((err) => console.error("Failed to send emails:", err));
    } else {
      console.warn("Skipping email sending: Missing SendGrid env variables");
    }

    return NextResponse.json({ data: requestRecord }, { status: 201 });
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}