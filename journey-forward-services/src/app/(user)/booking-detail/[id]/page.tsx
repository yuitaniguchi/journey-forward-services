// src/app/(user)/booking-detail/[id]/page.tsx
import React from "react";
import CancelBookingButton from "@/components/booking/CancelBookingButton";

type PageParams = Promise<{ id: string }>;

type BookingDetailPageProps = {
  params: PageParams;
};

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  // Next.js 16 で params が Promise なので await で unwrap
  const { id } = await params;

  // いまはモック表示（実データ連携はこのあとやる）
  const MOCK_EMAIL = "johnsmith@gmail.com";

  return (
    <main className="min-h-screen bg-[#f7f7f7] py-10">
      <div className="mx-auto max-w-5xl px-4 md:px-0">
        <h1 className="mb-8 text-center text-3xl font-semibold text-[#1f2933]">
          Booking Detail
        </h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: Thank you block */}
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold text-[#1a7c4c]">
              Thank you for Booking!
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-gray-700">
              Thank you for confirming your booking with Journey Forward
              Services (JFS). We&apos;re happy to help you move things forward —
              whether that&apos;s through donation or delivery.
            </p>

            <div className="mb-6 space-y-2 text-sm text-gray-800">
              <p className="font-semibold">When Will You Be Charged?</p>
              <p>
                Your payment will only be processed after the service is
                completed, once we issue the final invoice. You&apos;ll receive
                an email with the full breakdown before the charge is made.
              </p>
            </div>

            <div className="mb-6 space-y-2 text-sm text-gray-800">
              <p className="font-semibold">Cancellation Policy</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                <li>
                  <span className="font-semibold">Free cancellation</span> is
                  available up to{" "}
                  <span className="font-semibold">24 hours before</span> your
                  scheduled pick-up time.
                </li>
                <li>
                  If you cancel within 24 hours of the scheduled pick-up,{" "}
                  <span className="font-semibold">
                    a cancellation fee of $25
                  </span>{" "}
                  will be charged to your registered credit card.
                </li>
              </ul>
            </div>

            <div className="space-y-2 text-sm text-gray-800">
              <p className="font-semibold">Questions?</p>
              <p>
                If you have any questions, feel free to reply to this email or
                call us. We&apos;re happy to help!
              </p>
            </div>
          </section>

          {/* Right: Request summary（モック） */}
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-[#1a7c4c]">
              Request Number: {id}
            </h2>

            <div className="space-y-1 text-sm leading-relaxed text-gray-800">
              <p>
                <span className="font-semibold">Name: </span>John Smith
              </p>
              <p>
                <span className="font-semibold">Email: </span>
                {MOCK_EMAIL}
              </p>
              <p>
                <span className="font-semibold">Phone number: </span>
                444 (555) 6666
              </p>
              <p className="mt-3">
                <span className="font-semibold">Pickup Date: </span>
                Aug 14, 2025 – 9:00 AM
              </p>
              <p>
                <span className="font-semibold">Pickup Address: </span>
                1384 E 12th Avenue, Vancouver, BC, V6T 2J9
              </p>
              <p>
                <span className="font-semibold">Note: </span>
                2nd floor / No elevator
              </p>
            </div>

            {/* Estimate table */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-800">Estimate</h3>
              <p className="mt-1 text-xs text-gray-500">
                Minimum location fee: $50
              </p>

              <div className="mt-4 overflow-hidden rounded-md border border-gray-200 text-xs">
                <table className="min-w-full border-collapse">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">#</th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Item
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">Qty</th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Size
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Delivery
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Estimated price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white text-gray-800">
                    <tr>
                      <td className="border-t px-3 py-2">1</td>
                      <td className="border-t px-3 py-2">Sofa</td>
                      <td className="border-t px-3 py-2">1</td>
                      <td className="border-t px-3 py-2">Large</td>
                      <td className="border-t px-3 py-2">No</td>
                      <td className="border-t px-3 py-2">$20</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-col items-end text-sm text-gray-800">
                <div className="flex w-40 justify-between">
                  <span>Sub Total:</span>
                  <span>$70.00</span>
                </div>
                <div className="flex w-40 justify-between">
                  <span>Tax:</span>
                  <span>$8.40</span>
                </div>
                <div className="mt-1 flex w-40 justify-between font-semibold">
                  <span>Total:</span>
                  <span>$78.40</span>
                </div>
              </div>

              {/* 👇 ここに Cancel ボタンを追加 */}
              <CancelBookingButton requestId={Number(id)} />
            </div>
          </section>
        </div>

        {/* Free cancellation banner（テキストだけ雰囲気合わせ） */}
        <div className="mt-10 text-center text-sm font-semibold text-[#d34130]">
          Free cancellation up to 8:59 AM, Aug 13, 2025
        </div>
      </div>
    </main>
  );
}
