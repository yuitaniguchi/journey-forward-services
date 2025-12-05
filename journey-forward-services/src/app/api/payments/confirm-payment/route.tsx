import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import sgMail from "@sendgrid/mail";
import { render } from "@react-email/render";
import PaymentConfirmedCustomer from "@/emails/PaymentConfirmedCustomer";
import PaymentConfirmedAdmin from "@/emails/PaymentConfirmedAdmin";

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

    console.log("[confirm-payment] start. requestId =", numericRequestId);

    const payment = await prisma.payment.findUnique({
      where: { requestId: numericRequestId },
      include: {
        request: {
          include: {
            customer: true,
            items: true,
          },
        },
      },
    });

    if (!payment || !payment.request) {
      console.error(
        "[confirm-payment] Not found for requestId",
        numericRequestId
      );
      return NextResponse.json(
        { error: "Payment or Request record not found" },
        { status: 404 }
      );
    }

    if (!payment.stripePaymentIntentId) {
      return NextResponse.json(
        { error: "PaymentIntent is not created yet." },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.confirm(
      payment.stripePaymentIntentId
    );

    console.log(
      "[confirm-payment] Confirmed:",
      paymentIntent.id,
      paymentIntent.status
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

    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (apiKey && fromEmail && adminEmail) {
      sgMail.setApiKey(apiKey);

      const requestData = payment.request;
      const customerData = requestData.customer;

      const dateStr = requestData.createdAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
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
          deliveryAddress: requestData.deliveryRequired
            ? "Delivery"
            : undefined,
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

      await Promise.all([
        sgMail.send({
          to: customerData.email,
          from: fromEmail,
          subject: `Payment Confirmed - Request #${requestData.id}`,
          html: customerHtml,
        }),
        sgMail.send({
          to: adminEmail,
          from: fromEmail,
          subject: `[Payment Received] Request #${requestData.id}`,
          html: adminHtml,
        }),
      ]);

      console.log("[confirm-payment] Emails sent successfully");
    }

    return NextResponse.json(
      {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[confirm-payment] unexpected error:", error);
    return NextResponse.json(
      { error: error.message || "Error confirming payment" },
      { status: 500 }
    );
  }
}
