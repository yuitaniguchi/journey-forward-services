import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingReceivedCustomerEmail, sendBookingReceivedAdminEmail } from "@/lib/sendgrid";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const customer = await prisma.customer.upsert({
            where: { email: body.customer.email },
            update: {},
            create: {
                firstName: body.customer.firstName,
                lastName: body.customer.lastName,
                email: body.customer.email,
                phone: body.customer.phone,
            },
        });

        const savedRequest = await prisma.request.create({
            data: {
                customerId: customer.id,
                deliveryRequired: body.deliveryRequired || false,
                pickupPostalCode: body.pickupPostalCode,
                pickupAddressLine1: body.pickupAddressLine1,
                pickupAddressLine2: body.pickupAddressLine2,
                pickupCity: body.pickupCity,
                preferredDatetime: new Date(body.preferredDatetime),
                status: "RECEIVED",
                freeCancellationDeadline: new Date(body.freeCancellationDeadline),
            },
        });

        const props = {
            customer: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
            },
            request: {
                requestId: savedRequest.id,
                preferredDatetime: savedRequest.preferredDatetime,
                pickupAddress: savedRequest.pickupAddressLine1,
                deliveryAddress: savedRequest.deliveryAddressLine1 || "",
                status: savedRequest.status,
            },
            requestDate: savedRequest.createdAt.toISOString(),
        };

        await sendBookingReceivedCustomerEmail(props);
        await sendBookingReceivedAdminEmail(props);

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
    }
}
