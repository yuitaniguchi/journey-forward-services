import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInvoiceSentCustomerEmail } from "@/lib/sendgrid";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const quotation = await prisma.quotation.findUnique({
            where: { requestId: body.requestId },
            include: { request: { include: { customer: true } } },
        });

        if (!quotation) throw new Error("Quotation not found");

        const props = {
            customer: {
                firstName: quotation.request.customer.firstName,
                lastName: quotation.request.customer.lastName,
                email: quotation.request.customer.email,
            },
            request: {
                requestId: quotation.request.id,
                preferredDatetime: quotation.request.preferredDatetime,
                pickupAddress: quotation.request.pickupAddressLine1,
                deliveryAddress: quotation.request.deliveryAddressLine1 || "",
                status: quotation.request.status,
            },
            requestDate: quotation.request.createdAt.toISOString(),
            quotationTotal: quotation.total.toNumber(),
            bookingLink: quotation.bookingLink,
            finalTotal: body.finalTotal,
            paymentLink: body.paymentLink,
        };

        await sendInvoiceSentCustomerEmail(props);

        await prisma.request.update({
            where: { id: body.requestId },
            data: { status: "INVOICED" },
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
    }
}
