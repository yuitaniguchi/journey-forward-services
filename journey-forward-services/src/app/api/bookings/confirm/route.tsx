import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import sgMail from "@sendgrid/mail";
import { render } from "@react-email/render";
import BookingConfirmedCustomer from "@/emails/BookingConfirmedCustomer";
import BookingConfirmedAdmin from "@/emails/BookingConfirmedAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const requestId = Number(body.requestId);
    const paymentMethodId = body.paymentMethodId;

    if (Number.isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid Request ID" },
        { status: 400 }
      );
    }

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
      include: {
        customer: true,
        items: true,
        quotation: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    await prisma.request.update({
      where: { id: requestId },
      data: { status: "CONFIRMED" },
    });

    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (apiKey && fromEmail && adminEmail) {
      sgMail.setApiKey(apiKey);

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
        {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        }
      );

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
      const pdfLink = `${baseUrl}/api/pdf/quotations/${requestId}`;
      const token = booking.quotation?.bookingLink?.split("/").pop();
      const manageLink = token ? `${baseUrl}/booking-detail/${token}` : baseUrl;
      const dashboardLink = `${baseUrl}/admin/requests/${requestId}`;

      const commonProps = {
        customer: {
          firstName: booking.customer.firstName,
          lastName: booking.customer.lastName,
          email: booking.customer.email,
          phone: booking.customer.phone || "",
        },
        request: {
          requestId: booking.id,
          pickupAddress: `${booking.pickupAddressLine1} ${booking.pickupCity}`,
          deliveryAddress: booking.deliveryRequired
            ? "Delivery Requested"
            : undefined,
          pickupFloor: booking.pickupFloor ?? undefined,
          pickupElevator: booking.pickupElevator,
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

      await Promise.all([
        sgMail.send({
          to: booking.customer.email,
          from: fromEmail,
          subject: `Booking Confirmed - Request #${requestId}`,
          html: customerHtml,
        }),
        sgMail.send({
          to: adminEmail,
          from: fromEmail,
          subject: `[Booking Confirmed] Request #${requestId}`,
          html: adminHtml,
        }),
      ]);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Confirm API Error:", e);
    return NextResponse.json(
      { ok: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
