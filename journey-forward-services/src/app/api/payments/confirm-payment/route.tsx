import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { render } from "@react-email/render";
import PaymentConfirmedCustomer from "@/emails/PaymentConfirmedCustomer";
import PaymentConfirmedAdmin from "@/emails/PaymentConfirmedAdmin";

// [PRODUCTION] Uncomment for SendGrid
// import sgMail from "@sendgrid/mail";

// [DEMO] Keep for Gmail (Nodemailer)
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { requestId } = await req.json();
    const numericRequestId = Number(requestId);

    if (!requestId || Number.isNaN(numericRequestId) || numericRequestId <= 0) {
      return NextResponse.json(
        { error: "requestId must be a positive number" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { requestId: numericRequestId },
      include: { request: { include: { customer: true, items: true } } },
    });

    if (!payment || !payment.request || !payment.stripePaymentIntentId) {
      return NextResponse.json(
        { error: "Record invalid or not found" },
        { status: 404 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.confirm(
      payment.stripePaymentIntentId
    );

    await prisma.$transaction([
      prisma.payment.update({
        where: { requestId: numericRequestId },
        data: { status: paymentIntent.status.toUpperCase() },
      }),
      prisma.request.update({
        where: { id: numericRequestId },
        data: { status: "PAID" },
      }),
    ]);

    // --- PREPARE EMAIL CONTENT (Shared) ---
    const requestData = payment.request;
    const customerData = requestData.customer;
    const dateStr = requestData.createdAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const dashboardLink = `${baseUrl}/admin/requests/${requestData.id}`;

    const commonProps = {
      customer: {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone || "",
      },
      request: {
        requestId: requestData.id,
        pickupAddress: `${requestData.pickupAddressLine1} ${requestData.pickupCity}`,
        deliveryAddress: requestData.deliveryRequired ? "Delivery" : undefined,
        pickupFloor: requestData.pickupFloor ?? undefined,
        pickupElevator: requestData.pickupElevator,
        items: requestData.items.map((i) => ({
          name: i.name,
          size: i.size,
          quantity: i.quantity,
        })),
        preferredDatetime: requestData.preferredDatetime,
        status: "PAID" as const,
      },
      requestDate: dateStr,
      finalTotal: Number(payment.total),
    };

    const customerHtml = await render(
      <PaymentConfirmedCustomer {...commonProps} />
    );
    const adminHtml = await render(
      <PaymentConfirmedAdmin {...commonProps} dashboardLink={dashboardLink} />
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
        sgMail.send({ to: customerData.email, from: fromEmail, subject: `Payment Confirmed - Request #${requestData.id}`, html: customerHtml }),
        sgMail.send({ to: adminEmail, from: fromEmail, subject: `[Payment Received] Request #${requestData.id}`, html: adminHtml }),
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
          to: customerData.email,
          subject: `Payment Confirmed - Request #${requestData.id}`,
          html: customerHtml,
        }),
        transporter.sendMail({
          from: gmailUser,
          to: adminEmail,
          subject: `[Payment Received] Request #${requestData.id}`,
          html: adminHtml,
        }),
      ]);
      console.log("Payment Confirmed emails sent via Gmail");
    }
    // ============================================================

    return NextResponse.json(
      { paymentIntentId: paymentIntent.id, status: paymentIntent.status },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[confirm-payment] error:", error);
    return NextResponse.json(
      { error: error.message || "Error" },
      { status: 500 }
    );
  }
}
