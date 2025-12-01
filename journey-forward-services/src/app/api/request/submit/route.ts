import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingReceivedCustomerEmail, sendBookingReceivedAdminEmail } from "@/lib/sendgrid";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const customer = await prisma.customer.upsert({
            where: { email: body.customer.email },
            update: {
                firstName: body.customer.firstName,
                lastName: body.customer.lastName,
                phone: body.customer.phone,
            },
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
                pickupState: body.pickupState || "BC",
                preferredDatetime: new Date(body.preferredDatetime),
                status: "RECEIVED",
                freeCancellationDeadline: new Date(body.freeCancellationDeadline),

                pickupFloor: body.pickupFloor ? Number(body.pickupFloor) : null,
                pickupElevator: body.pickupElevator || false,

                items: {
                    create: body.items?.map((item: any) => ({
                        name: item.name,
                        quantity: item.quantity,
                        size: item.size,
                    })) || []
                }
            },
            include: { items: true }
        });

        const pickupAddressString = [
            savedRequest.pickupAddressLine1,
            savedRequest.pickupAddressLine2,
            savedRequest.pickupCity,
            savedRequest.pickupState,
            savedRequest.pickupPostalCode
        ].filter(Boolean).join(", ");

        const deliveryAddressString = savedRequest.deliveryRequired
            ? (body.deliveryAddressLine1 ? `${body.deliveryAddressLine1}, ${body.deliveryCity}` : "Address provided")
            : undefined;

        const emailProps = {
            customer: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone || "",
            },
            request: {
                requestId: savedRequest.id,
                preferredDatetime: savedRequest.preferredDatetime,
                pickupAddress: pickupAddressString,
                deliveryAddress: deliveryAddressString,
                status: savedRequest.status,
                items: savedRequest.items.map(item => ({
                    name: item.name,
                    size: item.size,
                    quantity: item.quantity,
                })),
                pickupFloor: savedRequest.pickupFloor ?? undefined,
                pickupElevator: savedRequest.pickupElevator,
            },
            requestDate: savedRequest.createdAt.toISOString(),
        };


        await sendBookingReceivedCustomerEmail(emailProps);

        await sendBookingReceivedAdminEmail({
            ...emailProps,
            dashboardLink: `https://admin.managesmartr.com/requests/${savedRequest.id}`
        });

        return NextResponse.json({ ok: true, requestId: savedRequest.id });

    } catch (e) {
        console.error("Submit Error:", e);
        return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
    }
}