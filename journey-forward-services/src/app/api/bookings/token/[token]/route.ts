import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        const quotation = await prisma.quotation.findFirst({
            where: {
                bookingLink: {
                    contains: token,
                },
            },
            include: {
                request: {
                    include: {
                        customer: true,
                        items: true,
                        quotation: true,
                        payment: true,
                    },
                },
            },
        });

        if (!quotation || !quotation.request) {
            return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
        }

        return NextResponse.json({ data: quotation.request }, { status: 200 });

    } catch (err) {
        console.error("GET /api/bookings/token/[token] error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}