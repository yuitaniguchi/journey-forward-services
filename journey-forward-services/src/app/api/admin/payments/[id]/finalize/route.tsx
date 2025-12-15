import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { render } from "@react-email/render";
import InvoiceSentCustomer from "@/emails/InvoiceSentCustomer";

// [PRODUCTION] Uncomment for SendGrid
// import sgMail from "@sendgrid/mail";

// [DEMO] Keep for Gmail (Nodemailer)
import nodemailer from "nodemailer";

type RouteParams = Promise<{ id: string }>;

export async function POST(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const { id: rawId } = await params;
    const requestId = Number(rawId);

    if (Number.isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid Request ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { subtotal, currency = "CAD", note, sendEmail } = body;
    const subtotalNum = Number(subtotal);

    if (isNaN(subtotalNum) || subtotalNum < 0) {
      return NextResponse.json(
        { error: "subtotal must be a non-negative number" },
        { status: 400 }
      );
    }

    const existingQuotation = await prisma.quotation.findUnique({
      where: { requestId },
      include: { discountCode: true },
    });

    let discountAmount = 0;
    let discountCodeId: number | null = null;

    if (existingQuotation?.discountCode) {
      discountCodeId = existingQuotation.discountCode.id;
      const dc = existingQuotation.discountCode;

      if (dc.type === "FIXED_AMOUNT") {
        discountAmount = Number(dc.value);
      } else if (dc.type === "PERCENTAGE") {
        discountAmount = subtotalNum * (Number(dc.value) / 100);
      }

      if (discountAmount > subtotalNum) {
        discountAmount = subtotalNum;
      }
    }

    const taxableSubtotal = subtotalNum - discountAmount;

    const taxRate = 0.12;
    const taxNum = taxableSubtotal * taxRate;
    const totalNum = taxableSubtotal + taxNum;

    // 1. Payment Record Upsert
    const payment = await prisma.payment.upsert({
      where: { requestId },
      update: {
        subtotal: subtotalNum,
        discountAmount: discountAmount,
        discountCodeId: discountCodeId,
        tax: taxNum,
        total: totalNum,
        status: "PENDING",
        note: note,
        sentAt: sendEmail ? new Date() : undefined,
      },
      create: {
        requestId,
        subtotal: subtotalNum,
        discountAmount: discountAmount,
        discountCodeId: discountCodeId,
        tax: taxNum,
        total: totalNum,
        status: "PENDING",
        currency,
        note: note,
        sentAt: sendEmail ? new Date() : undefined,
      },
    });

    // 2. Token / Link Generation
    let quotation = existingQuotation;
    let token = "";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (quotation && quotation.bookingLink) {
      if (quotation.bookingLink.includes("/confirm")) {
        const segments = quotation.bookingLink.split("/");
        const confirmIndex = segments.indexOf("confirm");
        if (confirmIndex > 0) token = segments[confirmIndex - 1];
      } else {
        token = quotation.bookingLink.split("/").pop() || "";
      }
    }

    if (!token) {
      token = crypto.randomUUID();
      const bookingLink = `${baseUrl}/booking/${token}/confirm`;
      await prisma.quotation.upsert({
        where: { requestId },
        update: { bookingLink },
        create: {
          requestId,
          subtotal: subtotalNum,
          tax: taxNum,
          total: totalNum,
          bookingLink,
        },
      });
    }

    const paymentLink = `${baseUrl}/booking/${token}/pay`;
    const pdfLink = `${baseUrl}/api/pdf/quotations/${requestId}`;

    // 3. Status Update
    if (sendEmail) {
      await prisma.request.update({
        where: { id: requestId },
        data: { status: "INVOICED" },
      });
    }

    // 4. Email Sending Logic
    if (sendEmail) {
      const requestData = await prisma.request.findUnique({
        where: { id: requestId },
        include: { customer: true, items: true },
      });

      if (requestData && requestData.customer.email) {
        // --- PREPARE EMAIL CONTENT (Shared) ---
        const dateStr = requestData.createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const emailItems = requestData.items.map((item) => ({
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: 0,
          delivery: requestData.deliveryRequired,
        }));

        const emailHtml = await render(
          <InvoiceSentCustomer
            customer={{
              firstName: requestData.customer.firstName,
              lastName: requestData.customer.lastName,
              email: requestData.customer.email,
              phone: requestData.customer.phone || "",
            }}
            request={{
              requestId: requestData.id,
              pickupAddress: `${requestData.pickupAddressLine1} ${requestData.pickupCity}`,
              deliveryAddress: requestData.deliveryRequired
                ? "Delivery Requested"
                : undefined,
              pickupFloor: requestData.pickupFloor ?? undefined,
              pickupElevator: requestData.pickupElevator,
              items: emailItems,
              preferredDatetime: requestData.preferredDatetime,
              status: "INVOICED" as const,
            }}
            quotationTotal={Number(totalNum)}
            subTotal={Number(subtotalNum)}
            discountAmount={Number(discountAmount)}
            tax={Number(taxNum)}
            finalTotal={Number(totalNum)}
            paymentLink={paymentLink}
            requestDate={dateStr}
            bookingLink={paymentLink}
            pdfLink={pdfLink}
            items={emailItems}
          />
        );

        // ============================================================
        // SWITCH: Choose Email Provider
        // ============================================================

        /* // [OPTION 1: PRODUCTION] SendGrid
        const apiKey = process.env.SENDGRID_API_KEY;
        const fromEmail = process.env.SENDGRID_FROM_EMAIL;
        if (apiKey && fromEmail) {
          sgMail.setApiKey(apiKey);
          await sgMail.send({
            to: requestData.customer.email,
            from: fromEmail,
            subject: `Your Final Invoice is Ready (Request #${requestId})`,
            html: emailHtml,
          });
        }
        */

        // [OPTION 2: DEMO] Nodemailer (Gmail)
        const gmailUser = process.env.GMAIL_USER;
        const gmailPass = process.env.GMAIL_PASS;
        if (gmailUser && gmailPass) {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: gmailUser, pass: gmailPass },
          });
          await transporter.sendMail({
            from: gmailUser,
            to: requestData.customer.email,
            subject: `Your Final Invoice is Ready (Request #${requestId})`,
            html: emailHtml,
          });
          console.log("Invoice email sent via Gmail");
        }
        // ============================================================
      }
    }

    return NextResponse.json({ payment }, { status: 200 });
  } catch (error) {
    console.error("Finalize API Error:", error);
    return NextResponse.json(
      { error: "Failed to finalize payment" },
      { status: 500 }
    );
  }
}
