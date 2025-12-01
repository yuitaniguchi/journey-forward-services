import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendQuotationSentEmail } from "@/lib/sendgrid";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const quotation = await prisma.quotation.create({
            data: {
                requestId: body.requestId,
                subtotal: body.subtotal,
                tax: body.tax,
                total: body.total,
                bookingLink: body.bookingLink,
            },
        });

        const request = await prisma.request.findUnique({
            where: { id: body.requestId },
            include: { customer: true },
        });

        if (!request) throw new Error("Request not found");

        const props = {
            customer: {
                firstName: request.customer.firstName,
                lastName: request.customer.lastName,
                email: request.customer.email,
            },
            request: {
                requestId: request.id,
                preferredDatetime: request.preferredDatetime,
                pickupAddress: request.pickupAddressLine1,
                deliveryAddress: request.deliveryAddressLine1 || "",
                status: request.status,
            },
            requestDate: request.createdAt.toISOString(),
            quotationTotal: quotation.total.toNumber(),
            bookingLink: quotation.bookingLink,
        };

        await sendQuotationSentEmail(props);

        await prisma.request.update({
            where: { id: body.requestId },
            data: { status: "QUOTED" },
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
    }
}
