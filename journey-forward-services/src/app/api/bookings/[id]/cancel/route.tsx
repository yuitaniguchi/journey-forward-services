import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
// import sgMail from "@sendgrid/mail"; // SendGridは使用しないためコメントアウト
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import CancellationNotificationCustomer from "@/emails/CancellationNotificationCustomer";
import CancellationNotificationAdmin from "@/emails/CancellationNotificationAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = Promise<{ id: string }>;

function parseId(paramId: string) {
  const id = Number(paramId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

const CANCELLATION_FEE = 25;

export async function POST(
  _request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);

    if (id === null) {
      return NextResponse.json(
        { error: "Invalid id. id must be a positive integer." },
        { status: 400 }
      );
    }

    console.log("[cancel] start. requestId =", id);

    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        payment: true,
        customer: true,
        items: true,
        quotation: true,
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (request.status === "CANCELLED") {
      return NextResponse.json(
        { error: "This booking is already cancelled." },
        { status: 400 }
      );
    }

    const now = new Date();
    const pickupTime = new Date(request.preferredDatetime);
    const freeDeadline = request.freeCancellationDeadline
      ? new Date(request.freeCancellationDeadline)
      : null;

    if (now >= pickupTime) {
      return NextResponse.json(
        {
          error:
            "This booking can no longer be cancelled because the pickup time has already passed.",
        },
        { status: 400 }
      );
    }

    let updatedRequest = null;
    let feeAmount = 0;
    let cancellationType = "";

    // ===== FREE CANCELLATION =====
    if (freeDeadline && now <= freeDeadline) {
      updatedRequest = await prisma.request.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: now,
          cancellationFee: null,
        },
        include: { customer: true, items: true, quotation: true },
      });

      cancellationType = "FREE";
      feeAmount = 0;
      console.log("[cancel] FREE cancellation completed. requestId =", id);
    }
    // ===== PAID CANCELLATION (within 24h) =====
    else {
      const payment = request.payment;

      if (!payment || !payment.stripeCustomerId || !payment.paymentMethod) {
        console.error("[cancel] Missing payment info for requestId =", id);
        return NextResponse.json(
          {
            error:
              "Cannot charge cancellation fee because payment information is missing.",
          },
          { status: 400 }
        );
      }

      const currency = payment.currency || "CAD";
      const feeAmountInCents = Math.round(CANCELLATION_FEE * 100);

      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: feeAmountInCents,
          currency,
          customer: payment.stripeCustomerId,
          payment_method: payment.paymentMethod,
          off_session: true,
          confirm: true,
          payment_method_types: ["card"],
          metadata: {
            requestId: String(request.id),
            cancellationType: "PAID",
          },
        });

        updatedRequest = await prisma.request.update({
          where: { id },
          data: {
            status: "CANCELLED",
            cancelledAt: now,
            cancellationFee: CANCELLATION_FEE,
          },
          include: { customer: true, items: true, quotation: true },
        });

        await prisma.payment.update({
          where: { requestId: id },
          data: {
            status: "CANCELLATION_FEE_CHARGED",
            stripePaymentIntentId: paymentIntent.id,
          },
        });

        cancellationType = "PAID";
        feeAmount = CANCELLATION_FEE;
        console.log("[cancel] PAID cancellation completed. requestId =", id);
      } catch (err: any) {
        console.error("[cancel] Error while charging cancellation fee:", err);
        return NextResponse.json(
          {
            error:
              "An error occurred while processing the cancellation fee. Please try again or contact support.",
          },
          { status: 500 }
        );
      }
    }

    if (updatedRequest) {
      await sendCancellationEmails(updatedRequest, feeAmount);
    }

    return NextResponse.json(
      {
        cancellationType,
        feeAmount,
        request: updatedRequest,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[cancel] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// --- Nodemailer (Gmail) に書き換えた関数 ---
async function sendCancellationEmails(request: any, fee: number) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!gmailUser || !gmailPass || !adminEmail) {
    console.warn("Skipping cancellation emails: Missing GMAIL env variables");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const dashboardLink = `${baseUrl}/admin/requests/${request.id}`;

  const dateStr = new Date(request.preferredDatetime).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }
  );

  const commonProps = {
    customer: {
      firstName: request.customer.firstName,
      lastName: request.customer.lastName,
      email: request.customer.email,
      phone: request.customer.phone || "",
    },
    request: {
      requestId: request.id,
      pickupAddress: `${request.pickupAddressLine1} ${request.pickupCity}`,
      items: [],
      status: "CANCELLED" as const,
      preferredDatetime: request.preferredDatetime,
      pickupFloor: 0,
      pickupElevator: false,
    },
    requestDate: dateStr,
  };

  const customerHtml = await render(
    <CancellationNotificationCustomer {...commonProps} cancellationFee={fee} />
  );

  const adminHtml = await render(
    <CancellationNotificationAdmin
      {...commonProps}
      cancellationFee={fee}
      dashboardLink={dashboardLink}
    />
  );

  try {
    await Promise.all([
      transporter.sendMail({
        from: gmailUser, // Gmail認証ユーザーと同じアドレス
        to: request.customer.email,
        subject: `Booking Cancelled - Request #${request.id}`,
        html: customerHtml,
      }),
      transporter.sendMail({
        from: gmailUser, // Gmail認証ユーザーと同じアドレス
        to: adminEmail,
        subject: `[Cancelled] Request #${request.id}`,
        html: adminHtml,
      }),
    ]);
    console.log("[cancel] Emails sent successfully via Gmail");
  } catch (e) {
    console.error("[cancel] Failed to send emails:", e);
  }
}
