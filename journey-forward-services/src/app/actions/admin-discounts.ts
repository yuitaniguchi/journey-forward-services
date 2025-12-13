'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { DiscountType } from '@prisma/client'

export async function createDiscountCode(data: {
    code: string
    description?: string
    type: DiscountType
    value: number
    startsAt?: string // ISO string
    expiresAt?: string // ISO string
}) {
    try {
        const existing = await prisma.discountCode.findUnique({
            where: { code: data.code },
        })

        if (existing) {
            return { success: false, message: 'Discount code already exists.' }
        }

        await prisma.discountCode.create({
            data: {
                code: data.code,
                description: data.description,
                type: data.type,
                value: data.value,
                startsAt: data.startsAt ? new Date(data.startsAt) : new Date(),
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                isActive: true,
            },
        })

        revalidatePath('/admin/discounts')
        return { success: true, message: 'Discount code created successfully.' }
    } catch (error) {
        console.error('Create Discount Error:', error)
        return { success: false, message: 'Failed to create discount code.' }
    }
}

export async function updateDiscountCode(id: number, data: {
    code: string
    description?: string
    type: DiscountType
    value: number
    startsAt: string
    expiresAt?: string // ISO string
}) {
    try {
        const existingWithSameCode = await prisma.discountCode.findUnique({
            where: { code: data.code },
        })

        if (existingWithSameCode && existingWithSameCode.id !== id) {
            return { success: false, message: 'Discount code already used by another record.' }
        }

        await prisma.discountCode.update({
            where: { id },
            data: {
                code: data.code,
                description: data.description,
                type: data.type,
                value: data.value,
                startsAt: new Date(data.startsAt),
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            },
        })

        revalidatePath('/admin/discounts')
        return { success: true, message: 'Discount code updated successfully.' }
    } catch (error) {
        console.error('Update Discount Error:', error)
        return { success: false, message: 'Failed to update discount code.' }
    }
}

export async function toggleDiscountStatus(id: number, isActive: boolean) {
    try {
        await prisma.discountCode.update({
            where: { id },
            data: { isActive },
        })
        revalidatePath('/admin/discounts')
        return { success: true }
    } catch (error) {
        return { success: false, message: 'Failed to update status.' }
    }
}

export async function deleteDiscountCode(id: number) {
    try {
        await prisma.discountCode.delete({
            where: { id },
        })
        revalidatePath('/admin/discounts')
        return { success: true }
    } catch (error) {
        return { success: false, message: 'Failed to delete discount code.' }
    }
}