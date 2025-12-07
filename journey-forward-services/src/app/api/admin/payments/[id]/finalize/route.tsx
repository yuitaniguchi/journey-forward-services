import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import sgMail from "@sendgrid/mail";
import { render } from "@react-email/render";
import InvoiceSentCustomer from "@/emails/InvoiceSentCustomer";
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

    // ★ note を受け取るようにする
    const body = (await request.json()) as {
      subtotal: number;
      currency?: string;
      note?: string | null;
    };
    const { subtotal, currency = "CAD", note } = body;

    const subtotalNum = Number(subtotal);

    if (isNaN(subtotalNum) || subtotalNum < 0) {
      return NextResponse.json(
        { error: "subtotal must be a non-negative number" },
        { status: 400 }
      );
    }

    const taxRate = 0.12; // BC Tax 12%
    const taxNum = subtotalNum * taxRate;
    const totalNum = subtotalNum + taxNum;

    const payment = await prisma.payment.upsert({
      where: { requestId },
      update: {
        subtotal: subtotalNum,
        tax: taxNum,
        total: totalNum,
        status: "PENDING",
        note: note ?? null, // ★ 既存レコード更新時に保存
      },
      create: {
        requestId,
        subtotal: subtotalNum,
        tax: taxNum,
        total: totalNum,
        status: "PENDING",
        currency,
        note: note ?? null, // ★ 新規作成時に保存
      },
    });

    let quotation = await prisma.quotation.findUnique({ where: { requestId } });
    let token = "";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (quotation && quotation.bookingLink) {
      token = quotation.bookingLink.split("/").pop() || "";
    }

    if (!token) {
      token = crypto.randomUUID();
      const bookingLink = `${baseUrl}/booking/confirmation/${token}`;
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

    const paymentLink = `${baseUrl}/final-payment/${token}`;
    const pdfLink = `${baseUrl}/api/pdf/quotations/${requestId}`;

    await prisma.request.update({
      where: { id: requestId },
      data: { status: "INVOICED" },
    });

    const requestData = await prisma.request.findUnique({
      where: { id: requestId },
      include: { customer: true, items: true },
    });

    if (!requestData || !requestData.customer.email) {
      throw new Error("Customer not found");
    }

    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;

    if (apiKey && fromEmail) {
      sgMail.setApiKey(apiKey);

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
          tax={Number(taxNum)}
          finalTotal={Number(totalNum)}
          paymentLink={paymentLink}
          requestDate={dateStr}
          bookingLink={paymentLink}
          pdfLink={pdfLink}
          items={emailItems}
        />
      );

      await sgMail.send({
        to: requestData.customer.email,
        from: fromEmail,
        subject: `Your Final Invoice is Ready (Request #${requestId})`,
        html: emailHtml,
      });
    }

    // ★ レスポンスに note を含める
    return NextResponse.json(
      {
        payment: {
          id: payment.id,
          subtotal: payment.subtotal,
          tax: payment.tax,
          total: payment.total,
          status: payment.status,
          currency: payment.currency,
          note: payment.note, // ← ここ
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Finalize API Error:", error);
    return NextResponse.json(
      { error: "Failed to finalize payment" },
      { status: 500 }
    );
  }
}
