import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { render } from "@react-email/render";
import BookingConfirmedCustomer from "@/emails/BookingConfirmedCustomer";
import BookingConfirmedAdmin from "@/emails/BookingConfirmedAdmin";
import nodemailer from "nodemailer";

function safeToNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  return Number(value.toString());
}

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export async function POST(req: NextRequest) {
  console.log("🚀 Booking Confirm API Started");

  try {
    const body = await req.json();
    const { requestId, paymentMethodId, discountCode } = body;
    console.log(`Payload: ID=${requestId}, Code=${discountCode}`);

    const requestData = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        customer: true,
        items: true,
        quotation: true,
      },
    });

    if (!requestData || !requestData.customer || !requestData.quotation) {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }

    const customer = requestData.customer;
    let quotation = requestData.quotation;

    if (discountCode) {
      console.log(`🔹 Validating code: ${discountCode}`);
      const codeRecord = await prisma.discountCode.findUnique({
        where: { code: discountCode },
      });

      if (!codeRecord) {
        return NextResponse.json(
          { error: "The discount code is invalid." },
          { status: 400 }
        );
      }
      if (!codeRecord.isActive) {
        return NextResponse.json(
          { error: "This discount code is no longer active." },
          { status: 400 }
        );
      }

      const now = new Date();

      if (codeRecord.startsAt) {
        const startDate = new Date(
          codeRecord.startsAt.toISOString().split("T")[0] + "T00:00:00-08:00"
        );
        if (now < startDate) {
          return NextResponse.json(
            { error: "This discount code is not yet valid." },
            { status: 400 }
          );
        }
      }

      if (codeRecord.expiresAt) {
        const expiryDate = new Date(
          codeRecord.expiresAt.toISOString().split("T")[0] + "T23:59:59-08:00"
        );
        if (now > expiryDate) {
          return NextResponse.json(
            {
              error:
                "The applied discount code has expired. Please remove it in the estimate section.",
            },
            { status: 400 }
          );
        }
      }

      const realSubtotal =
        safeToNumber(quotation.originalSubtotal) > 0
          ? safeToNumber(quotation.originalSubtotal)
          : safeToNumber(quotation.subtotal);
      const realTax =
        safeToNumber(quotation.originalTax) > 0
          ? safeToNumber(quotation.originalTax)
          : safeToNumber(quotation.tax);

      const taxRate = realSubtotal > 0 ? realTax / realSubtotal : 0.12;

      let discountAmount = 0;
      const val = safeToNumber(codeRecord.value);

      if (codeRecord.type === "FIXED_AMOUNT") {
        discountAmount = val;
      } else if (codeRecord.type === "PERCENTAGE") {
        discountAmount = realSubtotal * (val / 100);
      }

      if (discountAmount > realSubtotal) discountAmount = realSubtotal;
      discountAmount = roundCurrency(discountAmount);

      const newSubtotal = roundCurrency(realSubtotal - discountAmount);
      const newTax = roundCurrency(newSubtotal * taxRate);
      const newTotal = roundCurrency(newSubtotal + newTax);

      quotation = await prisma.quotation.update({
        where: { id: quotation.id },
        data: {
          discountCodeId: codeRecord.id,
          discountAmount: discountAmount,
          subtotal: newSubtotal,
          tax: newTax,
          total: newTotal,
          originalSubtotal: realSubtotal,
          originalTax: realTax,
          originalTotal:
            safeToNumber(quotation.originalTotal) > 0
              ? undefined
              : safeToNumber(quotation.total),
        },
      });
      console.log("✅ Discount applied and saved.");
    } else if (quotation.discountCodeId) {
      console.log("🧹 Cleaning up stale discount from DB...");

      const realSubtotal =
        safeToNumber(quotation.originalSubtotal) > 0
          ? safeToNumber(quotation.originalSubtotal)
          : safeToNumber(quotation.subtotal);
      const realTax =
        safeToNumber(quotation.originalTax) > 0
          ? safeToNumber(quotation.originalTax)
          : safeToNumber(quotation.tax);
      const realTotal =
        safeToNumber(quotation.originalTotal) > 0
          ? safeToNumber(quotation.originalTotal)
          : safeToNumber(quotation.total);

      quotation = await prisma.quotation.update({
        where: { id: quotation.id },
        data: {
          discountCodeId: null,
          discountAmount: 0,
          subtotal: realSubtotal,
          tax: realTax,
          total: realTotal,
        },
      });
      console.log("✅ Stale discount removed.");
    }

    if (paymentMethodId) {
      let stripeCustomerId = await findOrCreateStripeCustomer(
        requestData.customer
      );

      await prisma.payment.upsert({
        where: { requestId: requestData.id },
        update: {
          stripeCustomerId,
          paymentMethod: paymentMethodId,
          subtotal: quotation.subtotal,
          tax: quotation.tax,
          total: quotation.total,
          discountAmount: quotation.discountAmount,
          discountCodeId: quotation.discountCodeId,
          status: "Authorized",
        },
        create: {
          requestId: requestData.id,
          stripeCustomerId,
          paymentMethod: paymentMethodId,
          subtotal: quotation.subtotal,
          tax: quotation.tax,
          total: quotation.total,
          discountAmount: quotation.discountAmount,
          discountCodeId: quotation.discountCodeId,
          currency: "CAD",
          status: "Authorized",
        },
      });
    }

    await prisma.request.update({
      where: { id: requestData.id },
      data: { status: "CONFIRMED" },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    let token = "";
    if (quotation.bookingLink) {
      const parts = quotation.bookingLink.split("/");
      const confirmIndex = parts.indexOf("confirm");
      if (confirmIndex > 0) token = parts[confirmIndex - 1];
      else token = parts.pop() || "";
    }
    const manageLink = token
      ? `${baseUrl}/booking/${token}/dashboard`
      : baseUrl;
    const dashboardLink = `${baseUrl}/admin/requests/${requestData.id}`;
    const pdfLink = `${baseUrl}/api/pdf/quotations/${requestData.id}`;

    const dateStr = requestData.preferredDatetime.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    const cancellationDeadline =
      requestData.freeCancellationDeadline.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    const emailItems = requestData.items.map((i) => ({
      name: i.name,
      size: i.size,
      quantity: i.quantity,
    }));

    const displaySubtotal =
      safeToNumber(quotation.originalSubtotal) > 0
        ? safeToNumber(quotation.originalSubtotal)
        : safeToNumber(quotation.subtotal);

    const finalTotal = safeToNumber(quotation.total);
    const finalDiscount = safeToNumber(quotation.discountAmount);

    const customerHtml = await render(
      <BookingConfirmedCustomer
        customer={{
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone || "",
        }}
        request={{
          requestId: requestData.id,
          preferredDatetime: requestData.preferredDatetime,
          pickupAddress: requestData.pickupAddressLine1,
          pickupFloor: requestData.pickupFloor,
          pickupElevator: requestData.pickupElevator,
          deliveryAddress: requestData.deliveryAddressLine1,
          deliveryFloor: requestData.deliveryFloor,
          deliveryElevator: requestData.deliveryElevator,
          status: "CONFIRMED",
          items: emailItems,
          deliveryRequired: requestData.deliveryRequired,
        }}
        requestDate={dateStr}
        quotation={{
          subtotal: displaySubtotal,
          tax: safeToNumber(quotation.tax),
          total: finalTotal,
          discountAmount: finalDiscount,
        }}
        cancellationDeadline={cancellationDeadline}
        pdfLink={pdfLink}
        manageLink={manageLink}
      />
    );

    const adminHtml = await render(
      <BookingConfirmedAdmin
        customer={{
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone || "",
        }}
        request={{
          requestId: requestData.id,
          preferredDatetime: requestData.preferredDatetime,
          pickupAddress: requestData.pickupAddressLine1,
          status: "CONFIRMED" as any,
        }}
        requestDate={dateStr}
        quotationTotal={finalTotal}
        subTotal={displaySubtotal}
        discountAmount={finalDiscount}
        customerPhone={customer.phone || "N/A"}
        dashboardLink={dashboardLink}
      />
    );

    await sendEmail(customer.email, "Booking Confirmed", customerHtml);
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    await sendEmail(
      adminEmail,
      `[Admin] Booking Confirmed #${requestData.id}`,
      adminHtml
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("FATAL ERROR:", error);
    return NextResponse.json(
      { error: error.message || "A system error occurred." },
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

async function findOrCreateStripeCustomer(customer: {
  email: string;
  firstName: string;
  lastName: string;
}) {
  const existing = await stripe.customers.list({
    email: customer.email,
    limit: 1,
  });
  if (existing.data.length > 0) return existing.data[0].id;
  const newCustomer = await stripe.customers.create({
    email: customer.email,
    name: `${customer.firstName} ${customer.lastName}`,
  });
  return newCustomer.id;
}
