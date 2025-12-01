import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmedCustomerEmail, sendBookingConfirmedAdminEmail } from "@/lib/sendgrid";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const request = await prisma.request.update({
            where: { id: body.requestId },
            data: { status: "CONFIRMED" },
            include: { customer: true },
        });

        const adminProps = {
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
            requestDate: request.createdAt.toISOString(), // ← 追加
            customerPhone: request.customer.phone || "",
            quotationTotal: body.quotationTotal,
        };

        const customerProps = {
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
            quotationTotal: body.quotationTotal,
            cancellationDeadline: request.freeCancellationDeadline.toISOString(),
        };

        await sendBookingConfirmedAdminEmail(adminProps);
        await sendBookingConfirmedCustomerEmail(customerProps);

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
    }
}
