// src/app/(user)/booking-detail/[id]/page.tsx
import BookingDetailClient from "./BookingDetailClient";
import { getBooking } from "@/lib/getBooking";
import type { BookingRequest } from "@/types/booking";

type PageParams = Promise<{ id: string }>;

type BookingDetailPageProps = {
  params: PageParams;
};

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  // サーバー側で Promise を unwrap
  const { id } = await params;

  const booking: BookingRequest | null = await getBooking(id);

  if (!booking) {
    return (
      <main className="min-h-screen bg-[#f7f7f7] py-10">
        <div className="mx-auto max-w-5xl px-4 md:px-0">
          <h1 className="mb-8 text-center text-3xl font-semibold text-[#1f2933]">
            Booking Detail
          </h1>
          <p className="text-center text-red-600">
            Booking not found or failed to load booking details.
          </p>
        </div>
      </main>
    );
  }

  return <BookingDetailClient requestId={id} initialBooking={booking} />;
}
