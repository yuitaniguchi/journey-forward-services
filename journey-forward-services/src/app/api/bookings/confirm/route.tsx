import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { render } from "@react-email/render";
import BookingConfirmedCustomer from "@/emails/BookingConfirmedCustomer";
import BookingConfirmedAdmin from "@/emails/BookingConfirmedAdmin";

// [PRODUCTION] Uncomment for SendGrid
// import sgMail from "@sendgrid/mail";

// [DEMO] Keep for Gmail (Nodemailer)
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const requestId = Number(body.requestId);
    const paymentMethodId = body.paymentMethodId;

    if (Number.isNaN(requestId))
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    if (paymentMethodId) {
      await prisma.payment.upsert({
        where: { requestId },
        update: { paymentMethod: paymentMethodId },
        create: {
          requestId,
          paymentMethod: paymentMethodId,
          status: "PENDING",
          subtotal: 0,
          tax: 0,
          total: 0,
        },
      });
    }

    const booking = await prisma.request.findUnique({
      where: { id: requestId },
      include: { customer: true, items: true, quotation: true },
    });

    if (!booking)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    await prisma.request.update({
      where: { id: requestId },
      data: { status: "CONFIRMED" },
    });

    // --- PREPARE EMAIL CONTENT (Shared) ---
    const dateStr = booking.preferredDatetime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
    const deadlineStr = booking.freeCancellationDeadline.toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric", hour: "numeric", minute: "numeric" }
    );
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const pdfLink = `${baseUrl}/api/pdf/quotations/${requestId}`;

    let token = "";
    if (booking.quotation?.bookingLink) {
      if (booking.quotation.bookingLink.includes("/confirm")) {
        const parts = booking.quotation.bookingLink.split("/");
        const idx = parts.indexOf("confirm");
        if (idx > 0) token = parts[idx - 1];
      } else {
        token = booking.quotation.bookingLink.split("/").pop() || "";
      }
    }
    const manageLink = token ? `${baseUrl}/booking-detail/${token}` : baseUrl;
    const dashboardLink = `${baseUrl}/admin/requests/${requestId}`;

    const pickupAddressStr = [
      booking.pickupAddressLine1,
      booking.pickupAddressLine2,
      booking.pickupCity,
      booking.pickupState,
      booking.pickupPostalCode,
    ]
      .filter(Boolean)
      .join(", ");
    const deliveryAddressStr =
      booking.deliveryRequired && booking.deliveryAddressLine1
        ? [
            booking.deliveryAddressLine1,
            booking.deliveryAddressLine2,
            booking.deliveryCity,
            booking.deliveryState,
            booking.deliveryPostalCode,
          ]
            .filter(Boolean)
            .join(", ")
        : undefined;

    const commonProps = {
      customer: {
        firstName: booking.customer.firstName,
        lastName: booking.customer.lastName,
        email: booking.customer.email,
        phone: booking.customer.phone || "",
      },
      request: {
        requestId: booking.id,
        pickupAddress: pickupAddressStr,
        deliveryAddress: deliveryAddressStr,
        pickupFloor: booking.pickupFloor ?? undefined,
        pickupElevator: booking.pickupElevator,
        deliveryFloor: booking.deliveryRequired
          ? (booking.deliveryFloor ?? undefined)
          : undefined,
        deliveryElevator: booking.deliveryRequired
          ? booking.deliveryElevator
          : undefined,
        items: booking.items.map((i) => ({
          name: i.name,
          size: i.size,
          quantity: i.quantity,
          price: 0,
          delivery: booking.deliveryRequired,
        })),
        preferredDatetime: booking.preferredDatetime,
        status: "CONFIRMED" as const,
      },
      requestDate: dateStr,
    };

    const customerHtml = await render(
      <BookingConfirmedCustomer
        {...commonProps}
        quotation={{
          subtotal: Number(booking.quotation?.subtotal || 0),
          tax: Number(booking.quotation?.tax || 0),
          total: Number(booking.quotation?.total || 0),
        }}
        cancellationDeadline={deadlineStr}
        pdfLink={pdfLink}
        manageLink={manageLink}
      />
    );
    const adminHtml = await render(
      <BookingConfirmedAdmin
        {...commonProps}
        quotationTotal={Number(booking.quotation?.total || 0)}
        customerPhone={booking.customer.phone || "N/A"}
        dashboardLink={dashboardLink}
      />
    );

    // ============================================================
    // SWITCH: Choose Email Provider
    // ============================================================

    /*
    // [OPTION 1: PRODUCTION] SendGrid
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (apiKey && fromEmail && adminEmail) {
      sgMail.setApiKey(apiKey);
      await Promise.all([
        sgMail.send({ to: booking.customer.email, from: fromEmail, subject: `Booking Confirmed - Request #${requestId}`, html: customerHtml }),
        sgMail.send({ to: adminEmail, from: fromEmail, subject: `[Booking Confirmed] Request #${requestId}`, html: adminHtml }),
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
          to: booking.customer.email,
          subject: `Booking Confirmed - Request #${requestId}`,
          html: customerHtml,
        }),
        transporter.sendMail({
          from: gmailUser,
          to: adminEmail,
          subject: `[Booking Confirmed] Request #${requestId}`,
          html: adminHtml,
        }),
      ]);
      console.log("Confirmation emails sent via Gmail");
    }
    // ============================================================

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Confirm API Error:", e);
    return NextResponse.json(
      { ok: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
