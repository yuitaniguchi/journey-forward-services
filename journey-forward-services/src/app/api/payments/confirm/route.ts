import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPaymentConfirmedEmail } from "@/lib/sendgrid";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const payment = await prisma.payment.create({
            data: {
                requestId: body.requestId,
                subtotal: body.subtotal,
                tax: body.tax,
                total: body.total,
                status: "PAID",
                currency: "CAD",
                stripePaymentIntentId: body.stripePaymentIntentId,
            },
            include: { request: { include: { customer: true } } },
        });

        const propsCustomer = {
            customer: {
                firstName: payment.request.customer.firstName,
                lastName: payment.request.customer.lastName,
                email: payment.request.customer.email,
            },
            request: {
                requestId: payment.request.id,
                preferredDatetime: payment.request.preferredDatetime,
                pickupAddress: `${payment.request.pickupAddressLine1}${payment.request.pickupAddressLine2 ? ', ' + payment.request.pickupAddressLine2 : ''}, ${payment.request.pickupCity}, ${payment.request.pickupState} ${payment.request.pickupPostalCode}`,
                deliveryAddress: payment.request.deliveryRequired && payment.request.deliveryAddressLine1
                    ? `${payment.request.deliveryAddressLine1}${payment.request.deliveryAddressLine2 ? ', ' + payment.request.deliveryAddressLine2 : ''}, ${payment.request.deliveryCity}, ${payment.request.deliveryState} ${payment.request.deliveryPostalCode}`
                    : undefined,
                status: payment.request.status,
            },
            requestDate: payment.request.createdAt.toISOString(),
            finalTotal: payment.total.toNumber(),
            isCustomer: true,
        };

        const propsAdmin = {
            ...propsCustomer,
            isCustomer: false,
        };

        await sendPaymentConfirmedEmail(propsCustomer);
        await sendPaymentConfirmedEmail(propsAdmin);

        await prisma.request.update({
            where: { id: body.requestId },
            data: { status: "PAID" },
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
    }
}
