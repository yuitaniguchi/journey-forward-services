import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInvoiceSentCustomerEmail } from "@/lib/sendgrid";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const quotation = await prisma.quotation.findUnique({
            where: { requestId: body.requestId },
            include: {
                request: {
                    include: {
                        customer: true,
                        items: true
                    }
                }
            },
        });

        if (!quotation) throw new Error("Quotation not found");

        const request = quotation.request;

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

        const props = {
            customer: {
                firstName: request.customer.firstName,
                lastName: request.customer.lastName,
                email: request.customer.email,
                phone: request.customer.phone || "",
            },
            request: {
                requestId: request.id,
                preferredDatetime: request.preferredDatetime,
                pickupAddress: pickupAddressString,
                deliveryAddress: deliveryAddressString,
                pickupFloor: request.pickupFloor ?? undefined,
                pickupElevator: request.pickupElevator,
                status: request.status,
                items: mappedItems,
            },
            requestDate: request.createdAt.toISOString(),

            quotationTotal: quotation.total.toNumber(),
            bookingLink: quotation.bookingLink,
            subTotal: quotation.subtotal.toNumber(),
            tax: quotation.tax.toNumber(),
            minimumFee: 50,
            pdfLink: "#",
            items: mappedItems,

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