import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RequestStatus } from "@prisma/client";
import { render } from "@react-email/render";
import AutoConfirmationCustomer from "@/emails/AutoConfirmationCustomer";
import AutoConfirmationAdmin from "@/emails/AutoConfirmationAdmin";

// [PRODUCTION] Uncomment for SendGrid
// import sgMail from "@sendgrid/mail";

// [DEMO] Keep for Gmail (Nodemailer)
import nodemailer from "nodemailer";

export async function GET() {
  try {
    const bookings = await prisma.request.findMany({
      orderBy: { id: "desc" },
      include: { customer: true, quotation: true, payment: true },
    });
    return NextResponse.json({ data: bookings }, { status: 200 });
  } catch (err) {
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
      deliveryPostalCode,
      deliveryAddressLine1,
      deliveryAddressLine2,
      deliveryCity,
      deliveryState = "BC",
      deliveryFloor,
      deliveryElevator = false,
      preferredDatetime,
      freeCancellationDeadline,
      status = "RECEIVED",
      items = [],
    } = body ?? {};

    const { firstName, lastName, email, phone } = customer ?? {};

    // Validation checks (omitted for brevity, keep your original validation logic here)
    if (!pickupPostalCode || !firstName || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const preferredDt = new Date(preferredDatetime);
    const freeCancelDt = new Date(freeCancellationDeadline);
    const pickupFloorStr = pickupFloor ? String(pickupFloor) : null;
    const deliveryFloorStr = deliveryFloor ? String(deliveryFloor) : null;

    const customerRecord = await prisma.customer.upsert({
      where: { email },
      update: { firstName, lastName, phone },
      create: { firstName, lastName, email, phone },
    });

    const requestRecord = await prisma.request.create({
      data: {
        customerId: customerRecord.id,
        deliveryRequired,
        pickupPostalCode,
        pickupAddressLine1,
        pickupAddressLine2,
        pickupCity,
        pickupState,
        pickupFloor: pickupFloorStr,
        pickupElevator,
        deliveryPostalCode: deliveryRequired ? deliveryPostalCode : null,
        deliveryAddressLine1: deliveryRequired ? deliveryAddressLine1 : null,
        deliveryAddressLine2: deliveryRequired ? deliveryAddressLine2 : null,
        deliveryCity: deliveryRequired ? deliveryCity : null,
        deliveryState: deliveryRequired ? deliveryState : null,
        deliveryFloor: deliveryRequired ? deliveryFloorStr : null,
        deliveryElevator: deliveryRequired ? deliveryElevator : null,
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
      include: { customer: true, items: true },
    });

    // --- PREPARE EMAIL CONTENT (Shared) ---
    const deliveryAddressStr =
      deliveryRequired && deliveryAddressLine1
        ? `${deliveryAddressLine1} ${deliveryAddressLine2 || ""} ${deliveryCity}, ${deliveryPostalCode}`
        : null;

    const requestData = {
      requestId: requestRecord.id,
      pickupAddress: `${pickupAddressLine1} ${pickupAddressLine2 || ""} ${pickupCity}, ${pickupPostalCode}`,
      deliveryAddress: deliveryAddressStr,
      pickupFloor: pickupFloorStr || "N/A",
      pickupElevator: pickupElevator,
      deliveryFloor: deliveryRequired ? deliveryFloorStr : undefined,
      deliveryElevator: deliveryRequired ? deliveryElevator : undefined,
      items: requestRecord.items.map((item) => ({
        name: item.name,
        size: item.size,
        quantity: item.quantity,
        price: 0,
        delivery: deliveryRequired,
      })),
      preferredDatetime: preferredDt,
      status: status as any,
    };
    const customerData = { firstName, lastName, email, phone };
    const dateStr = preferredDt.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const dashboardLink = `${baseUrl}/admin/requests/${requestRecord.id}`;

    const customerHtml = await render(
      <AutoConfirmationCustomer
        customer={customerData}
        request={requestData}
        requestDate={dateStr}
      />
    );
    const adminHtml = await render(
      <AutoConfirmationAdmin
        customer={customerData}
        request={requestData}
        requestDate={dateStr}
        dashboardLink={dashboardLink}
      />
    );

    // ============================================================
    // SWITCH: Choose Email Provider
    // ============================================================

    /* // [OPTION 1: PRODUCTION] SendGrid
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (apiKey && fromEmail && adminEmail) {
      sgMail.setApiKey(apiKey);
      await Promise.all([
        sgMail.send({ to: adminEmail, from: fromEmail, subject: `[New Request] #${requestRecord.id} from ${firstName} ${lastName}`, html: adminHtml }),
        sgMail.send({ to: email, from: fromEmail, subject: `We received your request #${requestRecord.id} - Journey Forward Services`, html: customerHtml }),
      ]);
    }
    */

    // [OPTION 2: DEMO] Nodemailer (Gmail)
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (gmailUser && gmailPass && adminEmail) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass },
      });
      await Promise.all([
        transporter.sendMail({
          from: gmailUser,
          to: adminEmail,
          subject: `[New Request] #${requestRecord.id} from ${firstName} ${lastName}`,
          html: adminHtml,
        }),
        transporter.sendMail({
          from: gmailUser,
          to: email,
          subject: `We received your request #${requestRecord.id} - Journey Forward Services`,
          html: customerHtml,
        }),
      ]);
      console.log("Booking emails sent via Gmail");
    }
    // ============================================================

    return NextResponse.json({ data: requestRecord }, { status: 201 });
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
