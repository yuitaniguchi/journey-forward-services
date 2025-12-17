"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
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
  token: string;
  initialBooking: BookingRequest;
};

export default function BookingDetailClient({
  requestId,
  token,
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
  if (isPickupPassed && !isAlreadyCancelled) {
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
        setIsCancelling(false);
        return;
      }

      router.push(`/booking/${token}/cancelled`);
    } catch (err) {
      console.error("Unexpected error in cancel flow:", err);
      setCancelError(
        "An unexpected error occurred. Please try again or contact support."
      );
      setIsCancelling(false);
    }
  };

  const customerName =
    `${booking.customer.firstName} ${booking.customer.lastName}`.trim();
  const pickupDateTime = pickupTime ? pickupTime.toLocaleString() : "-";
  const quotation = booking.quotation;

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

  const pickupNoteDisplay = formatFloorInfo(
    booking.pickupFloor,
    booking.pickupElevator
  );

  const deliveryNoteDisplay = formatFloorInfo(
    booking.deliveryFloor,
    booking.deliveryElevator
  );

  const freeCancellationDeadline = booking.freeCancellationDeadline
    ? new Date(booking.freeCancellationDeadline).toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/Vancouver",
      })
    : null;

  const cancelledDate = booking.cancelledAt
    ? new Date(booking.cancelledAt).toLocaleString()
    : null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(val);

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="relative flex w-full items-center justify-center overflow-hidden border-b border-slate-100 bg-[#F5F5F5] py-10 md:py-14">
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: "url('/header-pattern.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <h1 className="text-center text-3xl font-bold text-black md:text-5xl">
            Booking Detail
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10 md:px-0">
        {isAlreadyCancelled && (
          <div className="mb-8 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="font-bold">This booking has been cancelled.</p>
              {cancelledDate && (
                <p
                  className="text-sm mt-1 text-red-700"
                  suppressHydrationWarning
                >
                  Cancelled on: {cancelledDate}
                </p>
              )}
              <p className="mt-2 text-sm text-red-700">
                No further action is required. If you have questions, please
                contact support.
              </p>
            </div>
          </div>
        )}

        <div
          className={`grid gap-8 md:grid-cols-2 transition-opacity duration-300 ${isAlreadyCancelled ? "opacity-60 grayscale-[30%]" : ""}`}
        >
          <section className="rounded-xl bg-white">
            <h2 className="mb-6 text-2xl font-bold text-[#1a7c4c]">
              Thank you for Booking!
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-black">
              Thank you for confirming your booking with Journey Forward
              Services (JFS). We&apos;re happy to help you move things forward —
              whether that&apos;s through donation or delivery.
            </p>

            <div className="mb-8 space-y-2 text-sm text-black">
              <p className="font-bold">When Will You Be Charged?</p>
              <p>
                Your payment will only be processed after the service is
                completed, once we issue the final invoice. You&apos;ll receive
                an email with the full breakdown before the charge is made.
              </p>
            </div>

            <div className="mb-8 space-y-2 text-sm text-black">
              <p className="font-bold">Cancellation Policy</p>
              <p>
                We understand that plans may change. Here&apos;s how
                cancellations work:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <span className="font-bold">Free cancellation</span> is
                  available up to{" "}
                  <span className="font-bold text-red-500">
                    24 hours before
                  </span>{" "}
                  your scheduled pick-up time.
                </li>
                <li>
                  If you cancel within 24 hours of the scheduled pick-up,{" "}
                  <span className="font-bold">a cancellation fee of $25</span>{" "}
                  will be charged to your registered credit card.
                </li>
              </ul>
            </div>

            <div className="space-y-2 text-sm text-black">
              <p className="font-bold">Questions?</p>
              <p>
                If you have any questions,{" "}
                <span className="font-bold">
                  feel free to reply to this email or call us
                </span>{" "}
                at [Phone Number]. We&apos;re happy to help!
              </p>
            </div>
          </section>

          <section className="h-fit rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-[#1a7c4c]">
              Request Number: {booking.id}
            </h2>

            <div className="mb-8 space-y-3 text-sm text-black">
              <div>
                <span className="font-bold">Name:</span> {customerName}
              </div>
              <div>
                <span className="font-bold">Email:</span>{" "}
                {booking.customer.email}
              </div>
              <div>
                <span className="font-bold">Phone number:</span>{" "}
                {booking.customer.phone || "-"}
              </div>
              <div>
                <span className="font-bold" suppressHydrationWarning>
                  Pickup Date:
                </span>{" "}
                {pickupDateTime}
              </div>

              <div>
                <span className="font-bold">Pickup Address:</span>{" "}
                {booking.pickupAddressLine1}, {booking.pickupCity},{" "}
                {booking.pickupPostalCode}
                {booking.pickupAddressLine2 && (
                  <span className="ml-1">({booking.pickupAddressLine2})</span>
                )}
              </div>

              <div>
                <span className="font-bold">Note:</span> {pickupNoteDisplay}
              </div>

              {booking.deliveryRequired && (
                <>
                  <div className="mt-4 border-t pt-4">
                    <span className="font-bold">Delivery Address:</span>{" "}
                    {booking.deliveryAddressLine1}, {booking.deliveryCity},{" "}
                    {booking.deliveryPostalCode}
                  </div>
                  <div>
                    <span className="font-bold">Note:</span>{" "}
                    {deliveryNoteDisplay}
                  </div>
                </>
              )}
            </div>

            <h3 className="mb-4 text-lg font-bold text-[#1a7c4c]">Estimate</h3>

            <div className="mb-6 overflow-hidden rounded-t-lg border border-gray-200">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="px-3 py-3 font-medium">#</th>
                    <th className="px-3 py-3 font-medium">Item</th>
                    <th className="px-3 py-3 font-medium text-center">Qty</th>
                    <th className="px-3 py-3 font-medium text-center">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {booking.items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="px-3 py-3 text-black">{idx + 1}</td>
                      <td className="px-3 py-3 font-medium text-black">
                        {item.name}
                      </td>
                      <td className="px-3 py-3 text-center text-black">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-3 text-center capitalize text-black">
                        {item.size}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {quotation && (
              <div className="flex flex-col gap-6">
                <div className="ml-auto w-full space-y-2 text-right text-sm">
                  <div className="flex justify-between font-bold text-black">
                    <span>Sub Total:</span>
                    <span>{formatCurrency(Number(quotation.subtotal))}</span>
                  </div>

                  {quotation.discountAmount &&
                  Number(quotation.discountAmount) > 0 ? (
                    <div className="flex justify-between font-bold text-[#ef4444]">
                      <span>Discount:</span>
                      <span>
                        -{formatCurrency(Number(quotation.discountAmount))}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex justify-between font-bold text-black">
                    <span>Tax:</span>
                    <span>{formatCurrency(Number(quotation.tax))}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-300 pt-2 text-base font-black text-black">
                    <span>Total:</span>
                    <span>{formatCurrency(Number(quotation.total))}</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {!isAlreadyCancelled && !isPickupPassed && (
          <div className="mt-12 text-center">
            <h3
              className="mb-4 text-lg font-bold text-[#ef4444]"
              suppressHydrationWarning
            >
              {freeCancellationDeadline
                ? `Free cancelation up to ${freeCancellationDeadline}`
                : "Free cancelation deadline information is not available."}
            </h3>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleOpenModal}
                disabled={isCancelDisabled}
                className="inline-flex min-w-[220px] items-center justify-center rounded-md bg-[#1a7c4c] px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#15603a] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
              >
                {isCancelling ? "Cancelling..." : "Cancel this Booking"}
              </button>
            </div>
            {disabledReason && (
              <p className="mt-2 text-xs text-gray-500">{disabledReason}</p>
            )}
            {cancelError && (
              <p className="mt-4 text-sm text-red-600">{cancelError}</p>
            )}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
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
                  className="rounded-full bg-[#1a7c4c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#15603a] disabled:cursor-not-allowed disabled:bg-gray-300"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCancelling}
                >
                  Keep booking
                </button>
                <button
                  type="button"
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
