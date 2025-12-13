import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { render } from "@react-email/render";
import PaymentConfirmedCustomer from "@/emails/PaymentConfirmedCustomer";
import PaymentConfirmedAdmin from "@/emails/PaymentConfirmedAdmin";

// [PRODUCTION] Uncomment for SendGrid
// import sgMail from "@sendgrid/mail";

// [DEMO] Keep for Gmail (Nodemailer)
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId } = body;

    const payment = await prisma.payment.findUnique({
      where: { requestId: Number(requestId) },
      include: {
        request: {
          include: { customer: true },
        },
      },
    });

    if (!payment || !payment.stripePaymentIntentId) {
      return NextResponse.json(
        { error: "Payment not found or not ready" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.confirm(
      payment.stripePaymentIntentId,
      {
        payment_method: payment.paymentMethod!,
      }
    );

    if (
      paymentIntent.status !== "succeeded" &&
      paymentIntent.status !== "processing"
    ) {
      return NextResponse.json(
        { error: `Payment failed: ${paymentIntent.status}` },
        { status: 400 }
      );
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", updatedAt: new Date() },
    });
    await prisma.request.update({
      where: { id: payment.requestId },
      data: { status: "PAID" },
    });

    const customer = payment.request.customer;
    const dateStr = new Date().toLocaleDateString("en-US");
    const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL}/admin/requests/${requestId}`;

    const discountAmount = payment.discountAmount
      ? Number(payment.discountAmount)
      : 0;
    const subTotal = Number(payment.subtotal);
    const tax = Number(payment.tax);
    const total = Number(payment.total);

    const customerHtml = await render(
      <PaymentConfirmedCustomer
        customer={{
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone || "",
        }}
        request={{
          requestId: payment.requestId,
          preferredDatetime: "",
          pickupAddress: "",
          status: "PAID",
        }}
        requestDate={dateStr}
        finalTotal={total}
        subTotal={subTotal}
        tax={tax}
        discountAmount={discountAmount}
      />
    );

    const adminHtml = await render(
      <PaymentConfirmedAdmin
        customer={{
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone || "",
        }}
        request={{
          requestId: payment.requestId,
          preferredDatetime: "",
          pickupAddress: "",
          status: "PAID",
        }}
        requestDate={dateStr}
        finalTotal={total}
        subTotal={subTotal}
        discountAmount={discountAmount}
        dashboardLink={dashboardLink}
      />
    );

    await sendEmail(customer.email, "Payment Confirmed", customerHtml);
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    await sendEmail(
      adminEmail,
      `[Admin] Payment Received #${requestId}`,
      adminHtml
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Confirm Payment Error:", error);
    return NextResponse.json(
      { error: error.message || "Payment confirmation failed" },
      { status: 500 }
    );
  }
}

async function sendEmail(to: string, subject: string, html: string) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;
  if (user && pass) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
    await transporter.sendMail({ from: user, to, subject, html });
  }
}
