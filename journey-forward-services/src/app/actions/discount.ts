'use server'

import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library';

function safeToNumber(value: Decimal | string | number | null | undefined): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'object' && 'd' in value) {
        return Number(value.toString());
    }
    return Number(value);
}

interface ClientQuotation {
    id: number;
    subtotal: number;
    tax: number;
    total: number;
    discountAmount: number;
    discountCodeId: number | null;
    originalSubtotal: number;
    originalTax: number;
    originalTotal: number;
    discountCode: string | null;
}

interface DiscountActionResult {
    success: boolean;
    message: string;
    quotation?: ClientQuotation;
}

export async function applyDiscountCode(requestId: number, code: string): Promise<DiscountActionResult> {
    try {
        const discountCode = await prisma.discountCode.findUnique({
            where: { code: code },
        })

        if (!discountCode) {
            return { success: false, message: 'Invalid discount code.' }
        }

        const now = new Date();

        if (!discountCode.isActive) {
            return { success: false, message: 'This code is no longer active.' }
        }

        if (discountCode.startsAt) {
            const startDate = new Date(discountCode.startsAt.toISOString().split('T')[0] + 'T00:00:00-08:00');
            if (now < startDate) {
                return { success: false, message: 'This code is not yet valid.' }
            }
        }

        if (discountCode.expiresAt) {
            const expiryDate = new Date(discountCode.expiresAt.toISOString().split('T')[0] + 'T23:59:59-08:00');
            if (now > expiryDate) {
                return { success: false, message: 'This code has expired.' }
            }
        }

        const booking = await prisma.request.findUnique({
            where: { id: requestId },
            select: {
                quotation: {
                    select: {
                        id: true, subtotal: true, tax: true, total: true
                    }
                }
            }
        });

        if (!booking?.quotation) {
            return { success: false, message: 'Quotation not found.' }
        }

        const quotation = booking.quotation;

        const baseSubtotal = safeToNumber(quotation.subtotal);
        const baseTax = safeToNumber(quotation.tax);
        const baseTotal = safeToNumber(quotation.total);

        const taxRate = baseSubtotal > 0 ? baseTax / baseSubtotal : 0.12;

        let discountAmount = 0
        const value = safeToNumber(discountCode.value);

        if (discountCode.type === 'FIXED_AMOUNT') {
            discountAmount = value
        } else if (discountCode.type === 'PERCENTAGE') {
            discountAmount = baseSubtotal * (value / 100)
        }

        if (discountAmount > baseSubtotal) {
            discountAmount = baseSubtotal
        }

        const newSubtotal = baseSubtotal - discountAmount;
        const newTax = newSubtotal * taxRate;
        const newTotal = newSubtotal + newTax;

        return {
            success: true,
            message: `Discount code "${discountCode.code}" applied! (Preview)`,
            quotation: {
                id: quotation.id,
                subtotal: newSubtotal,
                tax: newTax,
                total: newTotal,
                discountAmount: discountAmount,
                discountCodeId: discountCode.id,
                originalSubtotal: baseSubtotal,
                originalTax: baseTax,
                originalTotal: baseTotal,
                discountCode: discountCode.code
            }
        }

    } catch (error) {
        console.error('Error calculating discount:', error)
        return { success: false, message: 'An error occurred while calculating the discount.' }
    }
}

export async function removeDiscountCode(requestId: number): Promise<DiscountActionResult> {
    try {
        const booking = await prisma.request.findUnique({
            where: { id: requestId },
            select: {
                quotation: {
                    select: { id: true, subtotal: true, tax: true, total: true }
                }
            }
        });

        if (!booking?.quotation) {
            return { success: false, message: 'Quotation not found.' }
        }

        const q = booking.quotation;

        return {
            success: true,
            message: `Discount removed.`,
            quotation: {
                id: q.id,
                subtotal: safeToNumber(q.subtotal),
                tax: safeToNumber(q.tax),
                total: safeToNumber(q.total),
                discountAmount: 0,
                discountCodeId: null,
                originalSubtotal: safeToNumber(q.subtotal),
                originalTax: safeToNumber(q.tax),
                originalTotal: safeToNumber(q.total),
                discountCode: null
            }
        }

    } catch (error) {
        console.error('Error removing discount:', error)
        return { success: false, message: 'An error occurred.' }
    }
}