"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripeClient";
import type { BookingRequest, BookingResponse } from "@/types/booking";

type PaymentFormProps = {
  redirectLink: string;
};

function PaymentForm({ redirectLink }: PaymentFormProps) {
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

    setIsProcessing(false);

    if (error) {
      console.error("confirmSetup error:", error);
      setMessage(error.message ?? "Something went wrong.");
      return;
    }

    console.log("Setup succeeded ✅", setupIntent?.id);

    window.location.href = redirectLink;
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
          console.error("Failed to fetch booking by token");
          setLoadError("Invalid or expired link.");
          return;
        }

        const bookingJson = (await resBooking.json()) as {
          data: BookingRequest;
        };
        const bookingData = bookingJson.data;
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
          console.error("Failed to create Stripe intent");
          setLoadError("Failed to initialize payment.");
          return;
        }

        const intentJson = await resIntent.json();
        setClientSecret(intentJson.clientSecret);
      } catch (e) {
        console.error("Error in confirmation page:", e);
        setLoadError("Unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    loadBookingAndIntent();
  }, [token]);

  const elementsOptions = clientSecret
    ? {
        clientSecret,
        appearance: { theme: "stripe" as const },
        locale: "en" as const,
      }
    : undefined;

  if (isLoading || !booking) {
    return (
      <main className="min-h-screen bg-[#f7f7f7] py-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 text-center">
          <p className="text-gray-600">Loading booking information...</p>
        </div>
      </main>
    );
  }

  const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;
  const pickupDateTime = new Date(booking.preferredDatetime).toLocaleString();
  const pickupAddress = `${booking.pickupAddressLine1}, ${booking.pickupCity}`;
  const quotation = booking.quotation;

  const nextLink = "/";

  return (
    <main className="min-h-screen bg-[#f7f7f7] py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 md:px-0">
        <div className="flex flex-col items-center gap-2">
          <div className="text-sm font-bold text-gray-500">
            Booking Confirmation
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: Request Detail */}
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-[#1a7c4c]">
              Request Number: {booking.id}
            </h2>
            <div className="space-y-2 text-sm text-gray-800">
              <p>
                <span className="font-bold">Name:</span> {customerName}
              </p>
              <p>
                <span className="font-bold">Date:</span> {pickupDateTime}
              </p>
              <p>
                <span className="font-bold">Address:</span> {pickupAddress}
              </p>
            </div>

            {/* Estimate Table */}
            {quotation && (
              <div className="mt-8 border-t pt-4">
                <h3 className="font-bold mb-2">Quotation</h3>
                <div className="flex justify-between text-sm">
                  <span>Total Estimate:</span>
                  <span className="font-bold text-lg">
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
                <PaymentForm redirectLink={nextLink} />
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
