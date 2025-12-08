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

    const body = await request.json();
    const { subtotal, currency = "CAD" } = body;

    const subtotalNum = Number(subtotal);

    if (isNaN(subtotalNum) || subtotalNum < 0) {
      return NextResponse.json(
        { error: "subtotal must be a non-negative number" },
        { status: 400 }
      );
    }

    const taxRate = 0.12;
    const taxNum = subtotalNum * taxRate;
    const totalNum = subtotalNum + taxNum;

    // 1. Paymentレコードを保存
    const payment = await prisma.payment.upsert({
      where: { requestId },
      update: {
        subtotal: subtotalNum,
        tax: taxNum,
        total: totalNum,
        status: "PENDING",
      },
      create: {
        requestId,
        subtotal: subtotalNum,
        tax: taxNum,
        total: totalNum,
        status: "PENDING",
        currency,
      },
    });

    // 2. リンク生成 (トークン取得・生成)
    let quotation = await prisma.quotation.findUnique({ where: { requestId } });
    let token = "";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (quotation && quotation.bookingLink) {
      // 既存のリンクからトークン部分だけ取り出す
      // 例: .../booking/abcd-1234.../confirm -> abcd-1234...
      // split("/").pop() で取れる前提だが、パス構造が変わったので念のため
      // bookingLink が ".../token/confirm" のような形になっている可能性があるため、
      // 確実にトークンを取り出すならDBにトークンカラムを持たせるのがベストだが、
      // 現状は bookingLink の一部として管理しているので、以下のように取得
      const parts = quotation.bookingLink.split("/");
      // "/booking/[token]/confirm" の場合、後ろから2番目か、
      // 単純に末尾がtokenでない場合があるので注意が必要。
      // ただし前回の実装で bookingLink = .../booking/[token]/confirm としているなら
      // parts[parts.length - 2] がトークンになる可能性がある。

      // ★ 安全策: bookingLinkの形式に依存せず、常に有効なトークンを確保したい場合、
      // 新しく発行するか、正規表現で抜くのが良いが、
      // ここでは簡易的に「/confirm」などがついていない純粋なトークンであることを期待するか、
      // 新規発行して上書きするロジックにする。

      // 前回の実装では bookingLink = `${baseUrl}/booking/${token}/confirm` でした。
      // なので pop() だと "confirm" が取れてしまう可能性があります。

      if (quotation.bookingLink.includes("/confirm")) {
        // .../booking/TOKEN/confirm の形から TOKEN を抜く
        // http://.../booking/TOKEN/confirm
        const segments = quotation.bookingLink.split("/");
        const confirmIndex = segments.indexOf("confirm");
        if (confirmIndex > 0) {
          token = segments[confirmIndex - 1];
        }
      } else {
        // 旧形式 (.../confirmation/TOKEN) の場合
        token = quotation.bookingLink.split("/").pop() || "";
      }
    }

    // トークンが取れなかった場合は新規生成して保存
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

    // ★ 修正: 正しい支払い画面へのリンクを生成 (/booking/[token]/pay)
    const paymentLink = `${baseUrl}/booking/${token}/pay`;

    // 互換性のためbookingLinkも更新しておく（必須ではないが安全）
    // const bookingLink = `${baseUrl}/booking/${token}/confirm`;

    const pdfLink = `${baseUrl}/api/pdf/quotations/${requestId}`;

    // 3. ステータス更新
    await prisma.request.update({
      where: { id: requestId },
      data: { status: "INVOICED" },
    });

    // 4. メール送信
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
          paymentLink={paymentLink} // ★ ここに正しいリンクが渡る
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

    return NextResponse.json({ payment }, { status: 200 });
  } catch (error) {
    console.error("Finalize API Error:", error);
    return NextResponse.json(
      { error: "Failed to finalize payment" },
      { status: 500 }
    );
  }
}
