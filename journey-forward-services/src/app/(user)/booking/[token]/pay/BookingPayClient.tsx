"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookingRequest } from "@/types/booking";

type Props = {
  booking: BookingRequest;
  token: string;
  serverError?: string;
};

export default function BookingPayClient({
  booking,
  token,
  serverError,
}: Props) {
  const router = useRouter();

  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    serverError || null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleConfirmPayment = async () => {
    if (!booking) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsConfirming(true);

    try {
      const res = await fetch("/api/payments/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: booking.id }),
      });

      if (!res.ok) {
        setErrorMessage("Failed to confirm payment. Please try again.");
        return;
      }

      setSuccessMessage("Payment has been processed successfully.");
      router.push(`/booking/${token}/receipt`);
    } catch (err) {
      console.error(err);
      setErrorMessage("Unexpected error during payment.");
    } finally {
      setIsConfirming(false);
    }
  };

  // --- Data Formatting Helpers ---
  const fullName = `${booking.customer.firstName} ${booking.customer.lastName}`;
  const email = booking.customer.email;
  const phone = booking.customer.phone ?? "-";

  const pickupTime = booking.preferredDatetime
    ? new Date(booking.preferredDatetime)
    : null;
  const pickupDateTime = pickupTime ? pickupTime.toLocaleString() : "-";

  const payment = booking.payment;
  const finalAmount = payment?.total ?? 0;

  const discountAmount = payment?.discountAmount
    ? Number(payment.discountAmount)
    : 0;

  const canConfirmPayment = finalAmount > 0 && !isConfirming && !errorMessage;

  const formatMoney = (val: number) => val.toFixed(2);

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

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Header Section */}
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
        <h1 className="relative z-10 text-center text-3xl font-bold text-black md:text-5xl">
          Final Payment
        </h1>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 md:px-0">
        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 mx-auto max-w-3xl border border-red-200">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700 mx-auto max-w-3xl border border-emerald-200">
            {successMessage}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Booking Details & Items */}
          <div className="lg:col-span-2 space-y-8">
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-[#1a7c4c]">
                Booking Details
              </h2>

              <div className="space-y-4 text-sm text-black">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Block 1: Request # and Date */}
                  <div className="space-y-6">
                    <div>
                      <span className="font-bold block text-gray-500 text-xs uppercase tracking-wider mb-1">
                        Request Number
                      </span>
                      <p>{booking.id}</p>
                    </div>
                    <div>
                      <span className="font-bold block text-gray-500 text-xs uppercase tracking-wider mb-1">
                        Date & Time
                      </span>
                      <p>{pickupDateTime}</p>
                    </div>
                  </div>

                  {/* Block 2: Customer Info */}
                  <div>
                    <span className="font-bold block text-gray-500 text-xs uppercase tracking-wider mb-1">
                      Customer
                    </span>
                    <p>{fullName}</p>
                    <p className="text-gray-600">{email}</p>
                    <p className="text-gray-600">{phone}</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-4 pt-4">
                  <span className="font-bold block text-gray-500 text-xs uppercase tracking-wider mb-1">
                    Pickup Address
                  </span>
                  <p>
                    {booking.pickupAddressLine1}, {booking.pickupCity},{" "}
                    {booking.pickupPostalCode}
                    {booking.pickupAddressLine2 && (
                      <span className="ml-1">
                        ({booking.pickupAddressLine2})
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Note: {pickupNoteDisplay}
                  </p>
                </div>

                {booking.deliveryRequired && (
                  <div className="border-t border-gray-100 my-4 pt-4">
                    <span className="font-bold block text-gray-500 text-xs uppercase tracking-wider mb-1">
                      Delivery Address
                    </span>
                    <p>
                      {booking.deliveryAddressLine1}, {booking.deliveryCity},{" "}
                      {booking.deliveryPostalCode}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Note: {deliveryNoteDisplay}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Items Table */}
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-[#1a7c4c]">
                Items Summary
              </h3>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="px-3 py-3 font-medium">Item</th>
                      <th className="px-3 py-3 font-medium text-center">Qty</th>
                      <th className="px-3 py-3 font-medium text-center">
                        Size
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {booking.items.map((item, idx) => (
                      <tr key={idx}>
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
            </section>
          </div>

          {/* Right Column: Payment Action */}
          <div className="lg:col-span-1">
            <section className="sticky top-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
              <h2 className="mb-6 text-xl font-bold text-[#1a7c4c]">
                Payment Summary
              </h2>

              <p className="mb-6 text-sm text-gray-600 leading-relaxed">
                Please review the final amount. Your registered card will be
                charged immediately upon confirmation.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-black">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    ${formatMoney(Number(payment?.subtotal || 0))}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Discount</span>
                    <span className="font-medium">
                      -${formatMoney(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-black">
                  <span>Tax</span>
                  <span className="font-medium">
                    ${formatMoney(Number(payment?.tax || 0))}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-end">
                  <span className="font-bold text-lg text-black">Total</span>
                  <span className="font-bold text-2xl text-[#1a7c4c]">
                    ${formatMoney(Number(finalAmount))}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={!canConfirmPayment}
                className="w-full rounded-md bg-[#1a7c4c] px-6 py-4 text-base font-bold text-white shadow-sm hover:bg-[#15603a] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
              >
                {isConfirming ? "Processing..." : "Confirm & Pay"}
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">
                  Secure payment processing via Stripe
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
