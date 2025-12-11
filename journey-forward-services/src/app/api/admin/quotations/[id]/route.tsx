import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { render } from "@react-email/render";
import QuotationSentCustomer from "@/emails/QuotationSentCustomer";

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
    const { subtotal, sendEmail, note } = body;
    const subtotalNum = Number(subtotal);
    const taxRate = 0.12;
    const taxNum = subtotalNum * taxRate;
    const totalNum = subtotalNum + taxNum;

    const token = crypto.randomUUID();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const bookingLink = `${baseUrl}/booking/${token}/confirm`;
    const pdfLink = `${baseUrl}/api/pdf/quotations/${requestId}`;

    const quotation = await prisma.quotation.upsert({
      where: { requestId },
      update: {
        subtotal: subtotalNum,
        tax: taxNum,
        total: totalNum,
        bookingLink,
        note: note,
      },
      create: {
        requestId,
        subtotal: subtotalNum,
        tax: taxNum,
        total: totalNum,
        bookingLink,
        note: note,
      },
    });

    await prisma.request.update({
      where: { id: requestId },
      data: { status: "QUOTED" },
    });

    if (sendEmail) {
      const requestData = await prisma.request.findUnique({
        where: { id: requestId },
        include: { customer: true, items: true },
      });

      if (!requestData || !requestData.customer.email) {
        throw new Error("Customer email not found");
      }

      // --- PREPARE EMAIL CONTENT (Shared) ---
      const dateStr = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const emailItems = requestData.items.map((item) => ({
        name: item.name,
        size: item.size,
        quantity: item.quantity,
        price: 0,
        delivery: requestData.deliveryRequired,
      }));
      const deliveryAddressStr = requestData.deliveryRequired
        ? [
            requestData.deliveryAddressLine1,
            requestData.deliveryAddressLine2,
            requestData.deliveryCity,
            requestData.deliveryPostalCode,
          ]
            .filter(Boolean)
            .join(", ")
        : undefined;

      const emailHtml = await render(
        <QuotationSentCustomer
          customer={{
            firstName: requestData.customer.firstName,
            lastName: requestData.customer.lastName,
            email: requestData.customer.email,
            phone: requestData.customer.phone || "",
          }}
          request={{
            requestId: requestData.id,
            pickupAddress: `${requestData.pickupAddressLine1} ${requestData.pickupAddressLine2 || ""} ${requestData.pickupCity}, ${requestData.pickupPostalCode}`,
            deliveryAddress: deliveryAddressStr,
            pickupFloor: requestData.pickupFloor ?? undefined,
            pickupElevator: requestData.pickupElevator,
            deliveryFloor: requestData.deliveryRequired
              ? requestData.deliveryFloor
              : undefined,
            deliveryElevator: requestData.deliveryRequired
              ? requestData.deliveryElevator
              : undefined,
            preferredDatetime: requestData.preferredDatetime,
            status: requestData.status as any,
          }}
          quotationTotal={Number(totalNum)}
          subTotal={Number(subtotalNum)}
          tax={Number(taxNum)}
          bookingLink={bookingLink}
          pdfLink={pdfLink}
          requestDate={dateStr}
          items={emailItems}
        />
      );

      // ============================================================
      // SWITCH: Choose Email Provider
      // ============================================================

      /*
      // [OPTION 1: PRODUCTION] SendGrid
      const apiKey = process.env.SENDGRID_API_KEY;
      const fromEmail = process.env.SENDGRID_FROM_EMAIL;
      if (apiKey && fromEmail) {
        sgMail.setApiKey(apiKey);
        await sgMail.send({
          to: requestData.customer.email,
          from: fromEmail,
          subject: `Your Estimate is Ready! (Request #${requestId})`,
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
          subject: `Your Estimate is Ready! (Request #${requestId})`,
          html: emailHtml,
        });
        console.log("Quotation email sent via Gmail");
      }
      // ============================================================
    }

    return NextResponse.json({ quotation }, { status: 200 });
  } catch (error) {
    console.error("Quotation API Error:", error);
    return NextResponse.json(
      { error: "Failed to save quotation" },
      { status: 500 }
    );
  }
}
