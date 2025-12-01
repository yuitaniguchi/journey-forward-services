import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCancellationNotificationEmail } from "@/lib/sendgrid";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const request = await prisma.request.update({
            where: { id: body.requestId },
            data: { status: "CANCELLED", cancelledAt: new Date(), cancellationFee: body.cancellationFee },
            include: { customer: true },
        });

        const propsCustomer = {
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
            cancellationFee: request.cancellationFee?.toNumber() || 0,
            isCustomer: true,
        };

        const propsAdmin = { ...propsCustomer, isCustomer: false };

        await sendCancellationNotificationEmail(propsCustomer);
        await sendCancellationNotificationEmail(propsAdmin);

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
    }
}
