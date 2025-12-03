import "server-only";
import { headers } from "next/headers";
import type { BookingRequest, BookingResponse } from "@/types/booking";

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function getBooking(id: string): Promise<BookingRequest | null> {
  try {
    const baseUrl = await getBaseUrl(); // ★ ここも await
    const res = await fetch(`${baseUrl}/api/bookings/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("getBooking error status:", res.status);
      return null;
    }

    const json = (await res.json()) as BookingResponse;
    return json.data;
  } catch (e) {
    console.error("getBooking error:", e);
    return null;
  }
}
