// src/app/(user)/booking-detail/[id]/BookingDetailClient.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type RequestStatus =
  | "RECEIVED"
  | "QUOTED"
  | "CONFIRMED"
  | "INVOICED"
  | "PAID"
  | "CANCELLED";

type BookingApiResponse = {
  data: {
    id: number;
    status: RequestStatus;
    preferredDatetime: string;
    freeCancellationDeadline: string | null;
  };
};

type BookingDetailClientProps = {
  requestId: string;
};

export default function BookingDetailClient({
  requestId,
}: BookingDetailClientProps) {
  const router = useRouter();

  const MOCK_EMAIL = "johnsmith@gmail.com";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [isLoadingBooking, setIsLoadingBooking] = useState(true);
  const [bookingStatus, setBookingStatus] = useState<RequestStatus | null>(
    null
  );
  const [pickupTime, setPickupTime] = useState<Date | null>(null);

  // ----- 予約情報を取得して、ボタンの有効/無効を決める -----
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setIsLoadingBooking(true);

        const res = await fetch(`/api/bookings/${requestId}`);
        if (!res.ok) {
          console.error(
            "Failed to fetch booking detail",
            res.status,
            await res.text()
          );
          return;
        }

        const json = (await res.json()) as BookingApiResponse;
        const booking = json.data;

        setBookingStatus(booking.status);
        setPickupTime(new Date(booking.preferredDatetime));
      } catch (err) {
        console.error("Unexpected error while fetching booking:", err);
      } finally {
        setIsLoadingBooking(false);
      }
    };

    fetchBooking();
  }, [requestId]);

  const now = new Date();
  const isPickupPassed = pickupTime ? now > pickupTime : false;
  const isAlreadyCancelled = bookingStatus === "CANCELLED";

  // Cancel ボタンの disable 条件
  const isCancelDisabled =
    isLoadingBooking || isCancelling || isPickupPassed || isAlreadyCancelled;

  let disabledReason: string | null = null;
  if (isAlreadyCancelled) {
    disabledReason = "This booking has already been cancelled.";
  } else if (isPickupPassed) {
    disabledReason =
      "Cancellation is no longer available after the pickup time.";
  }

  const handleOpenModal = () => {
    if (isCancelDisabled) return;
    setCancelError(null);
    setIsModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      setIsCancelling(true);
      setCancelError(null);

      const res = await fetch(`/api/bookings/${requestId}/cancel`, {
        method: "POST",
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Cancel API failed", res.status, text);
        setCancelError(
          "Failed to cancel this booking. Please try again or contact support."
        );
        return;
      }

      // キャンセル成功 → 完了ページへ
      router.push(`/booking-cancelled/${requestId}`);
    } catch (err) {
      console.error("Unexpected error in cancel flow:", err);
      setCancelError(
        "An unexpected error occurred. Please try again or contact support."
      );
    } finally {
      setIsCancelling(false);
      setIsModalOpen(false);
    }
  };

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

          {/* Right: Request summary（今はモック表示） */}
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-[#1a7c4c]">
              Request Number: {requestId}
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
            </div>
          </section>
        </div>

        {/* Free cancellation banner */}
        <div className="mt-10 text-center text-sm font-semibold text-[#d34130]">
          Free cancelation up to 8:59 AM, Aug 13, 2025
        </div>

        {/* Cancel button + 補足メッセージ */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleOpenModal}
            disabled={isCancelDisabled}
            className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#1a7c4c] px-10 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#15603a] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            {isCancelling ? "Cancelling..." : "Cancel this Booking"}
          </button>
        </div>

        {disabledReason && (
          <p className="mt-2 text-center text-xs text-gray-500">
            {disabledReason}
          </p>
        )}

        {cancelError && (
          <p className="mt-4 text-center text-sm text-red-600">{cancelError}</p>
        )}

        {/* モーダル */}
        {isModalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-3 text-lg font-semibold text-[#1f2933]">
                Cancel this booking?
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-gray-700">
                Are you sure you want to cancel your booking?{" "}
                <span className="font-semibold">
                  Free cancellation is available up to 24 hours before your
                  scheduled pick-up time.
                </span>{" "}
                If you cancel within 24 hours of the scheduled pick-up,{" "}
                <span className="font-semibold">$25 will be charged</span> to
                your registered credit card.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCancelling}
                >
                  Keep booking
                </button>
                <button
                  type="button"
                  className="rounded-full bg-[#1a7c4c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#15603a] disabled:cursor-not-allowed disabled:bg-gray-300"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                >
                  {isCancelling ? "Cancelling..." : "Yes, cancel this booking"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
