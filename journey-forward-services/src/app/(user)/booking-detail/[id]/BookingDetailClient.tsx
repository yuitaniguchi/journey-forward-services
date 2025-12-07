"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookingRequest } from "@/types/booking";

type RequestStatus =
  | "RECEIVED"
  | "QUOTED"
  | "CONFIRMED"
  | "INVOICED"
  | "PAID"
  | "CANCELLED";

type BookingDetailClientProps = {
  requestId: string;
  initialBooking: BookingRequest;
};

export default function BookingDetailClient({
  requestId,
  initialBooking,
}: BookingDetailClientProps) {
  const router = useRouter();
  const booking = initialBooking;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const pickupTime = booking.preferredDatetime
    ? new Date(booking.preferredDatetime)
    : null;
  const bookingStatus: RequestStatus = booking.status as RequestStatus;

  const now = new Date();
  const isPickupPassed = pickupTime ? now > pickupTime : false;
  const isAlreadyCancelled = bookingStatus === "CANCELLED";

  const isCancelDisabled = isCancelling || isPickupPassed || isAlreadyCancelled;

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

      window.location.reload();
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

  const customerName =
    `${booking.customer.firstName} ${booking.customer.lastName}`.trim();
  const pickupDateTime = pickupTime ? pickupTime.toLocaleString() : "-";

  const formatFloorInfo = (
    floor: string | number | null | undefined,
    elevator: boolean | null | undefined
  ) => {
    const parts = [];
    if (floor) parts.push(`Floor: ${floor}`);
    if (elevator !== undefined && elevator !== null) {
      parts.push(elevator ? "Elevator: Yes" : "Elevator: No");
    }
    return parts.length > 0 ? parts.join(" / ") : "No additional notes";
  };

  const pickupNote = formatFloorInfo(
    booking.pickupFloor,
    booking.pickupElevator
  );
  const deliveryNote = formatFloorInfo(
    booking.deliveryFloor,
    booking.deliveryElevator
  );

  const freeCancellationDeadline = booking.freeCancellationDeadline
    ? new Date(booking.freeCancellationDeadline).toLocaleString()
    : null;

  return (
    <main className="min-h-screen bg-[#f7f7f7] py-10">
      <div className="mx-auto max-w-5xl px-4 md:px-0">
        <h1 className="mb-8 text-center text-3xl font-semibold text-[#1f2933]">
          Booking Detail
        </h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: Thank you block & Policy */}
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold text-[#1a7c4c]">
              Thank you for Booking!
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-gray-700">
              Thank you for confirming your booking with Journey Forward
              Services (JFS). We&apos;re happy to help you move things forward —
              whether that&apos;s through donation or delivery.
            </p>

            {/* Status Badge */}
            <div className="mb-6">
              <span className="font-semibold text-gray-800 text-sm mr-2">
                Current Status:
              </span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold 
                ${bookingStatus === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
              >
                {bookingStatus}
              </span>
            </div>

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

          {/* Right: Request summary */}
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-[#1a7c4c]">
              Request Number: {booking.id}
            </h2>

            <div className="space-y-4 text-sm leading-relaxed text-gray-800">
              {/* Customer Info */}
              <div className="border-b pb-4">
                <p>
                  <span className="font-semibold">Name: </span>
                  {customerName || "-"}
                </p>
                <p>
                  <span className="font-semibold">Email: </span>
                  {booking.customer.email || "-"}
                </p>
                <p>
                  <span className="font-semibold">Phone number: </span>
                  {booking.customer.phone || "-"}
                </p>
              </div>

              {/* Pickup Info */}
              <div className="border-b pb-4">
                <p className="font-bold text-[#1a7c4c] mb-1">Pickup Info</p>
                <p>
                  <span className="font-semibold">Date: </span>
                  {pickupDateTime}
                </p>
                <p>
                  <span className="font-semibold">Address: </span>
                  {booking.pickupAddressLine1}
                  {booking.pickupAddressLine2
                    ? ` ${booking.pickupAddressLine2}`
                    : ""}
                  , {booking.pickupCity}, {booking.pickupState}{" "}
                  {booking.pickupPostalCode}
                </p>
                <p>
                  <span className="font-semibold">Note: </span>
                  {pickupNote}
                </p>
              </div>

              {/* Delivery Info */}
              {booking.deliveryRequired && (
                <div className="border-b pb-4">
                  <p className="font-bold text-[#1a7c4c] mb-1">Delivery Info</p>
                  <p>
                    <span className="font-semibold">Address: </span>
                    {booking.deliveryAddressLine1}
                    {booking.deliveryAddressLine2
                      ? ` ${booking.deliveryAddressLine2}`
                      : ""}
                    , {booking.deliveryCity}, {booking.deliveryState}{" "}
                    {booking.deliveryPostalCode}
                  </p>
                  <p>
                    <span className="font-semibold">Note: </span>
                    {deliveryNote}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Free cancellation banner */}
        {!isAlreadyCancelled && !isPickupPassed && (
          <div className="mt-10 text-center text-sm font-semibold text-[#d34130]">
            {freeCancellationDeadline
              ? `Free cancelation up to ${freeCancellationDeadline}`
              : "Free cancelation deadline information is not available."}
          </div>
        )}

        {/* Cancel button */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleOpenModal}
            disabled={isCancelDisabled}
            className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#1a7c4c] px-10 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#15603a] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            {isAlreadyCancelled
              ? "Cancelled"
              : isCancelling
                ? "Cancelling..."
                : "Cancel this Booking"}
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

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
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
