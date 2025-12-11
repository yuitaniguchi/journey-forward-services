// src/lib/availability.ts
import { z } from 'zod';
import { bookingSchema } from '@/lib/schemas/booking';

// Reuse the exact postalCode rules from the booking form schema
export const availabilitySchema = z.object({
  postalCode: bookingSchema.shape.postalCode,
});

export function validatePostalCode(postalCode: string) {
  // First: run the same Zod validation as the booking form
  const result = availabilitySchema.safeParse({ postalCode });

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return {
      ok: false as const,
      error: firstIssue?.message ?? 'Invalid postal code',
    };
  }

  // Second: restrict to Greater Vancouver area
  const cleaned = result.data.postalCode.replace(/\s+/g, '').toUpperCase();

  // Basic safety: make sure it’s at least 2 chars (it will be, thanks to regex)
  const first = cleaned[0];
  const second = cleaned[1];

  const isGreaterVancouver =
    first === 'V' && ['3', '4', '5', '6', '7'].includes(second);

  if (!isGreaterVancouver) {
    return {
      ok: false as const,
      error: 'We currently serve the Greater Vancouver area only.',
    };
  }

  // All good 🎉
  return {
    ok: true as const,
    value: result.data.postalCode,
  };
}
