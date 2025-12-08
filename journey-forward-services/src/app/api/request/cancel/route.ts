import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCancellationNotificationEmail } from "@/lib/sendgrid.backup";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const request = await prisma.request.update({
            where: { id: body.requestId },
            data: {
                status: "CANCELLED",
                cancelledAt: new Date(),
                cancellationFee: body.cancellationFee
            },
            include: {
                customer: true,
                items: true
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
        };

        const commonProps = {
            customer: {
                firstName: request.customer.firstName,
                lastName: request.customer.lastName,
                email: request.customer.email,
                phone: request.customer.phone || "",
            },
            request: emailRequestData,
            requestDate: request.createdAt.toISOString(),
            cancellationFee: request.cancellationFee?.toNumber() || 0,
        };

        await sendCancellationNotificationEmail({
            ...commonProps,
            isCustomer: true,
        });

        await sendCancellationNotificationEmail({
            ...commonProps,
            isCustomer: false,
            dashboardLink: `https://admin.managesmartr.com/requests/${request.id}`
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
    }
}