import { z } from "zod";
import { ALLOWED_CITIES } from "@/components/forms/AddressInput";

// Regex
export const POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
export const PHONE_REGEX = /^[\d\s\-\(\)\+]{10,20}$/;

// Schemas
const pickupDateTimeSchema = z
    .string()
    .min(1, "Pickup date & time is required")
    .refine((value) => {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return false;
        const diff = d.getTime() - Date.now();
        return diff >= 24 * 60 * 60 * 1000;
    }, "Pickup time must be at least 24 hours from now");

const addressSchema = z.object({
    street: z.string().min(1, "Street address is required"),
    line2: z.string().optional(),
    city: z
        .string()
        .min(1, "City is required")
        .refine(
            (val) => ALLOWED_CITIES.includes(val),
            "Service area not supported"
        ),
    province: z.string(),
});

export const bookingSchema = z.object({
    postalCode: z
        .string()
        .min(1, "Postal code is required")
        .regex(POSTAL_CODE_REGEX, "Invalid postal code format (e.g. V6B 1A1)"),
    pickupDateTime: pickupDateTimeSchema,
    deliveryRequired: z.boolean(),

    // Pickup Address
    address: addressSchema,
    floor: z.string().min(1, "Floor is required"),
    hasElevator: z.boolean(),

    // Delivery Address
    deliveryAddress: z.object({
        postalCode: z.string().optional(), // 追加
        street: z.string().optional(),
        line2: z.string().optional(),
        city: z.string().optional(),
        province: z.string().optional(),
    }).optional(),

    deliveryFloor: z.string().optional(),
    deliveryElevator: z.boolean().optional(),

    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),

    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email address"),

    phone: z
        .string()
        .min(1, "Phone number is required")
        .regex(PHONE_REGEX, "Invalid phone number format")
        .refine((val) => {
            const digits = val.replace(/\D/g, "");
            return digits.length >= 10;
        }, "Phone number must have at least 10 digits"),
}).superRefine((data, ctx) => {
    if (data.deliveryRequired) {
        // Delivery Postal Code Check
        if (!data.deliveryAddress?.postalCode) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["deliveryAddress", "postalCode"],
                message: "Postal code is required",
            });
        } else if (!POSTAL_CODE_REGEX.test(data.deliveryAddress.postalCode)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["deliveryAddress", "postalCode"],
                message: "Invalid postal code format",
            });
        }

        if (!data.deliveryAddress?.street) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["deliveryAddress", "street"],
                message: "Street address is required",
            });
        }
        if (!data.deliveryAddress?.city || !ALLOWED_CITIES.includes(data.deliveryAddress.city)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["deliveryAddress", "city"],
                message: "City is required and must be supported",
            });
        }
        if (!data.deliveryFloor) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["deliveryFloor"],
                message: "Floor is required",
            });
        }
    }
});

export type BookingFormValues = z.infer<typeof bookingSchema>;