import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmedCustomerEmail, sendBookingConfirmedAdminEmail } from "@/lib/sendgrid";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const request = await prisma.request.update({
            where: { id: body.requestId },
            data: { status: "CONFIRMED" },
            include: {
                customer: true,
                items: true,
                quotation: true
            },
        });

        const pickupAddressString = [
            request.pickupAddressLine1,
            request.pickupAddressLine2,
            request.pickupCity,
            request.pickupState,
            request.pickupPostalCode
        ].filter(Boolean).join(", ");

        const deliveryAddressString = request.deliveryAddressLine1
            ? [
                request.deliveryAddressLine1,
                request.deliveryAddressLine2,
                request.deliveryCity,
                request.deliveryState,
                request.deliveryPostalCode
            ].filter(Boolean).join(", ")
            : "";

        const mappedItems = request.items.map(item => ({
            name: item.name,
            size: item.size,
            quantity: item.quantity,
            price: 0,
            delivery: false
        }));

        const emailRequestData = {
            requestId: request.id,
            preferredDatetime: request.preferredDatetime,
            pickupAddress: pickupAddressString,
            deliveryAddress: deliveryAddressString,
            pickupFloor: request.pickupFloor ?? undefined,
            pickupElevator: request.pickupElevator,
            status: request.status,
            items: mappedItems,
            deliveryRequired: request.deliveryRequired
        };

        const adminProps = {
            customer: {
                firstName: request.customer.firstName,
                lastName: request.customer.lastName,
                email: request.customer.email,
                phone: request.customer.phone || "",
            },
            request: emailRequestData,
            requestDate: request.createdAt.toISOString(),
            customerPhone: request.customer.phone || "",
            quotationTotal: request.quotation?.total.toNumber() || 0,
        };

        const customerProps = {
            customer: {
                firstName: request.customer.firstName,
                lastName: request.customer.lastName,
                email: request.customer.email,
                phone: request.customer.phone || "",
            },
            request: emailRequestData,
            requestDate: request.createdAt.toISOString(),
            cancellationDeadline: request.freeCancellationDeadline.toISOString(),
            quotation: {
                subtotal: request.quotation?.subtotal.toNumber() || 0,
                tax: request.quotation?.tax.toNumber() || 0,
                total: request.quotation?.total.toNumber() || 0,
            }
        };

        await sendBookingConfirmedAdminEmail(adminProps);
        await sendBookingConfirmedCustomerEmail(customerProps);

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
    }
}