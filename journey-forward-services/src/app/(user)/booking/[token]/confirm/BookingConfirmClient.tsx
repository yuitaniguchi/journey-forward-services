"use client";

import React, { useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripeClient";
import type { BookingRequest } from "@/types/booking";

type PaymentFormProps = {
  onSuccess: () => void;
  requestId: number;
};

function PaymentForm({ onSuccess, requestId }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    const paymentElement = elements.getElement(PaymentElement);
    if (!paymentElement) {
      console.error("PaymentElement is not loaded");
      setMessage("Payment form failed to load. Please reload the page.");
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });

    if (error) {
      console.error("confirmSetup error:", error);
      setMessage(error.message ?? "Something went wrong.");
      setIsProcessing(false);
      return;
    }

    console.log("Setup succeeded ✅", setupIntent?.id);

    const paymentMethodId =
      typeof setupIntent.payment_method === "string"
        ? setupIntent.payment_method
        : setupIntent.payment_method?.id;

    try {
      await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          paymentMethodId,
        }),
      });
    } catch (e) {
      console.error("Failed to confirm booking or send email", e);
    } finally {
      setIsProcessing(false);
      onSuccess();
    }
  };

  return (
    <>
      <div className="mb-6">
        <PaymentElement />
      </div>

      {message && (
        <p className="mb-3 whitespace-pre-line text-sm text-red-600">
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!stripe || isProcessing}
        className="mt-2 flex w-full items-center justify-center rounded-full bg-[#1a7c4c] px-6 py-3 text-sm font-semibold text-white hover:bg-[#15603a] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isProcessing ? "Processing..." : "Save card & continue"}
      </button>
    </>
  );
}

type Props = {
  booking: BookingRequest;
  token: string;
  clientSecret: string; // ★ 追加: サーバーから受け取る
};

export default function BookingConfirmClient({
  booking,
  token,
  clientSecret,
}: Props) {
  const nextLink = `/booking/${token}/dashboard`;

  const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;
  const pickupDateTime = new Date(booking.preferredDatetime).toLocaleString();
  const pickupAddress = `${booking.pickupAddressLine1}, ${booking.pickupCity}`;
  const quotation = booking.quotation;

  const elementsOptions = clientSecret
    ? {
        clientSecret,
        appearance: { theme: "stripe" as const },
        locale: "en" as const,
      }
    : undefined;

  return (
    <main className="min-h-screen bg-[#f7f7f7] py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 md:px-0">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1a7c4c] bg-[#1a7c4c] text-sm font-semibold text-white">
                ✓
              </div>
              <span className="text-xs text-[#1a7c4c] font-medium">
                Detail info
              </span>
            </div>
            <div className="h-px w-16 bg-[#1a7c4c]" />
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1a7c4c] bg-white text-sm font-semibold text-[#1a7c4c]">
                2
              </div>
              <span className="text-xs text-[#1a7c4c] font-medium">
                Payment info
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: Request Detail */}
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-[#1a7c4c]">
              Request Number: {booking.id}
            </h2>
            <div className="space-y-3 text-sm text-gray-800">
              <div>
                <span className="font-bold block text-gray-500 text-xs">
                  Name
                </span>{" "}
                {customerName}
              </div>
              <div>
                <span className="font-bold block text-gray-500 text-xs">
                  Date
                </span>{" "}
                {pickupDateTime}
              </div>
              <div>
                <span className="font-bold block text-gray-500 text-xs">
                  Address
                </span>{" "}
                {pickupAddress}
              </div>
            </div>

            {quotation && (
              <div className="mt-8 border-t pt-4">
                <h3 className="font-bold mb-3 text-gray-700">
                  Estimate Summary
                </h3>
                <div className="flex justify-between text-sm mb-1">
                  <span>Subtotal</span>
                  <span>${Number(quotation.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span>Tax</span>
                  <span>${Number(quotation.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-dashed pt-2">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-[#1a7c4c]">
                    ${Number(quotation.total).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* Right: Payment */}
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold text-[#1a7c4c]">
              Credit Card Information
            </h3>

            {/* クライアント側でのfetch待ちがなくなり、即座に表示される */}
            {clientSecret && elementsOptions ? (
              <Elements stripe={stripePromise} options={elementsOptions}>
                <PaymentForm
                  requestId={booking.id}
                  onSuccess={() => {
                    window.location.href = nextLink;
                  }}
                />
              </Elements>
            ) : (
              <p className="text-red-500">
                Failed to initialize payment system.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
