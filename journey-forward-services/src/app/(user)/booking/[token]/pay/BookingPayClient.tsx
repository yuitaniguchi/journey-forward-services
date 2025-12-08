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
      // 新しいパス構成に合わせて遷移先を修正
      router.push(`/booking/${token}/receipt`);
    } catch (err) {
      console.error(err);
      setErrorMessage("Unexpected error during payment.");
    } finally {
      setIsConfirming(false);
    }
  };

  // UI表示用データの準備
  const fullName = `${booking.customer.firstName} ${booking.customer.lastName}`;
  const email = booking.customer.email;
  const phone = booking.customer.phone ?? "-";
  const pickupAddress = `${booking.pickupAddressLine1}, ${booking.pickupCity}`;
  // サーバーから渡されたISO文字列をローカル日時に変換
  const preferredDatetime = new Date(
    booking.preferredDatetime
  ).toLocaleString();

  const payment = booking.payment;
  const finalAmount = payment?.total ?? 0;

  // 金額があり、処理中でなければボタンを押せる
  const canConfirmPayment = finalAmount > 0 && !isConfirming && !errorMessage;

  const formatMoney = (val: number) => val.toFixed(2);

  return (
    <main className="min-h-screen bg-[#f7f7f7] py-12">
      <div className="mx-auto max-w-5xl px-4 md:px-0">
        <h1 className="mb-10 text-center text-2xl font-semibold text-[#1f2933] md:text-3xl">
          Final Payment
        </h1>

        {errorMessage && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 mx-auto max-w-3xl">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700 mx-auto max-w-3xl">
            {successMessage}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold text-[#1a7c4c]">
              Confirm & Pay
            </h2>
            <p className="mb-4 text-sm text-gray-700">
              Please review the final amount and confirm the payment. Your card
              will be charged immediately.
            </p>
          </section>

          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold text-[#1a7c4c]">
              Request Number: {booking.id}
            </h3>
            <div className="space-y-2 text-sm text-gray-800 mb-6">
              <p>
                <span className="font-semibold">Name:</span> {fullName}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {email}
              </p>
              <p>
                <span className="font-semibold">Date:</span> {preferredDatetime}
              </p>
            </div>

            <div className="mt-4 overflow-hidden rounded-md border border-gray-200 text-sm">
              <div className="bg-gray-50 p-3 flex justify-between">
                <span>Subtotal</span>
                <span>${formatMoney(Number(payment?.subtotal || 0))}</span>
              </div>
              <div className="bg-gray-50 p-3 flex justify-between border-t border-gray-200">
                <span>Tax</span>
                <span>${formatMoney(Number(payment?.tax || 0))}</span>
              </div>
              <div className="bg-white p-3 flex justify-between font-bold text-lg border-t border-gray-200">
                <span>Total</span>
                <span className="text-[#1a7c4c]">
                  ${formatMoney(Number(finalAmount))}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={!canConfirmPayment}
              className="mt-6 flex w-full items-center justify-center rounded-full bg-[#1a7c4c] px-6 py-3 text-sm font-semibold text-white hover:bg-[#15603a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isConfirming
                ? "Processing..."
                : `Pay $${formatMoney(Number(finalAmount))}`}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
