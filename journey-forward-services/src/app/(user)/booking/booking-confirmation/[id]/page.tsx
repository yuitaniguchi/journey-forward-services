"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function BookingConfirmationPage() {
  const params = useParams<{ id: string }>();
  const token = params?.id;
  const router = useRouter();

  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoadError("Invalid URL.");
      setIsLoading(false);
      return;
    }

    const loadBookingAndIntent = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const resBooking = await fetch(`/api/bookings/token/${token}`);
        if (!resBooking.ok) {
          setLoadError("Invalid or expired link.");
          return;
        }

        const bookingJson = (await resBooking.json()) as {
          data: BookingRequest;
        };
        const bookingData = bookingJson.data;

        if (
          bookingData.status === "CONFIRMED" ||
          bookingData.status === "INVOICED" ||
          bookingData.status === "PAID"
        ) {
          router.replace(`/booking-detail/${token}`);
          return;
        }

        setBooking(bookingData);

        const resIntent = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: bookingData.id,
            customerEmail: bookingData.customer.email,
          }),
        });

        if (!resIntent.ok) {
          setLoadError("Failed to initialize payment.");
          return;
        }

        const intentJson = await resIntent.json();
        setClientSecret(intentJson.clientSecret);
      } catch (e) {
        console.error(e);
        setLoadError("Unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    loadBookingAndIntent();
  }, [token, router]);

  const elementsOptions = clientSecret
    ? {
        clientSecret,
        appearance: { theme: "stripe" as const },
        locale: "en" as const,
      }
    : undefined;

  const nextLink = `/booking-detail/${token}`;

  if (isLoading || !booking) {
    return (
      <main className="min-h-screen bg-[#f7f7f7] py-10 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;
  const pickupDateTime = new Date(booking.preferredDatetime).toLocaleString();
  const quotation = booking.quotation;

  const pickupAddress = `${booking.pickupAddressLine1}${
    booking.pickupAddressLine2 ? ` ${booking.pickupAddressLine2}` : ""
  }, ${booking.pickupCity}, ${booking.pickupState} ${
    booking.pickupPostalCode ?? ""
  }`;

  const deliveryAddress = booking.deliveryRequired
    ? `${booking.deliveryAddressLine1}${
        booking.deliveryAddressLine2 ? ` ${booking.deliveryAddressLine2}` : ""
      }, ${booking.deliveryCity}, ${booking.deliveryState} ${
        booking.deliveryPostalCode ?? ""
      }`
    : null;

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
                  Pickup Address
                </span>{" "}
                {pickupAddress}
              </div>

              {deliveryAddress && (
                <div>
                  <span className="font-bold block text-gray-500 text-xs">
                    Delivery Address
                  </span>{" "}
                  {deliveryAddress}
                </div>
              )}
            </div>

            {/* Estimate Table */}
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
                {loadError || "Initializing payment..."}
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
