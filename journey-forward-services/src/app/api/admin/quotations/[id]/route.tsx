import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import sgMail from "@sendgrid/mail";
import { render } from "@react-email/render";
import QuotationSentCustomer from "@/emails/QuotationSentCustomer";
import fs from "fs";
import path from "path";
import crypto from "crypto";

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
    const { subtotal, sendEmail } = body;

    const taxRate = 0.12;
    const subtotalNum = Number(subtotal);
    const taxNum = subtotalNum * taxRate;
    const totalNum = subtotalNum + taxNum;

    const token = crypto.randomUUID();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const bookingLink = `${baseUrl}/booking/booking-confirmation/${token}`;
    const pdfLink = `${baseUrl}/api/pdf/quotations/${requestId}`;

    const quotation = await prisma.quotation.upsert({
      where: { requestId },
      update: {
        subtotal: subtotalNum,
        tax: taxNum,
        total: totalNum,
        bookingLink,
      },
      create: {
        requestId,
        subtotal: subtotalNum,
        tax: taxNum,
        total: totalNum,
        bookingLink,
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

      const apiKey = process.env.SENDGRID_API_KEY;
      const fromEmail = process.env.SENDGRID_FROM_EMAIL;

      const logoPath = path.join(process.cwd(), "public", "pdf-logo.png");
      let logoBuffer: Buffer | null = null;
      try {
        if (fs.existsSync(logoPath)) {
          logoBuffer = fs.readFileSync(logoPath);
        }
      } catch (e) {
        console.error("Failed to load logo image", e);
      }

      if (apiKey && fromEmail) {
        sgMail.setApiKey(apiKey);

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
              pickupAddress: `${requestData.pickupAddressLine1} ${requestData.pickupCity}`,
              deliveryAddress: requestData.deliveryRequired
                ? "Delivery Requested"
                : undefined,
              pickupFloor: requestData.pickupFloor ?? undefined,
              pickupElevator: requestData.pickupElevator,
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

        await sgMail.send({
          to: requestData.customer.email,
          from: fromEmail,
          subject: `Your Estimate is Ready! (Request #${requestId})`,
          html: emailHtml,
        });
      }
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
