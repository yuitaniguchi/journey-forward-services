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
  requestId: string;
};

function PaymentForm({ requestId }: PaymentFormProps) {
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
      console.error("confirmSetup error RAW:", error);
      console.error("confirmSetup error DETAILS:", {
        type: (error as any).type,
        code: (error as any).code,
        decline_code: (error as any).decline_code,
        message: error.message,
      });

      setMessage(error.message ?? "Something went wrong.");
      return;
    }

    console.log("Setup succeeded ✅", setupIntent?.id);

    // カード登録が終わったら、この requestId の Booking Detail へ
    window.location.href = `/booking-detail/${requestId}`;
  };

  return (
    <>
      <div className="mb-6">
        <PaymentElement
          onReady={() => {
            console.log("PaymentElement ready");
          }}
          onError={(event: any) => {
            console.error("PaymentElement error", event);
            setMessage(
              event?.error?.message ??
                "Failed to load payment form. Please check your Stripe keys."
            );
          }}
        />
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
  const requestId = params?.id;

  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) {
      setLoadError("Invalid URL. Request ID is missing.");
      setIsLoading(false);
      return;
    }

    const loadBookingAndIntent = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        // 1. Booking 情報を取得
        const resBooking = await fetch(`/api/bookings/${requestId}`);
        if (!resBooking.ok) {
          const text = await resBooking.text();
          console.error(
            "Failed to fetch booking for confirmation",
            resBooking.status,
            text
          );
          setLoadError("Failed to load booking information.");
          return;
        }

        const bookingJson = (await resBooking.json()) as BookingResponse;
        const bookingData = bookingJson.data;
        setBooking(bookingData);

        // 2. Stripe SetupIntent を作成
        const resIntent = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId,
            customerEmail: bookingData.customer.email,
          }),
        });

        if (!resIntent.ok) {
          const text = await resIntent.text();
          console.error(
            "Failed to create Stripe intent",
            resIntent.status,
            text
          );
          setLoadError("Failed to initialize payment.");
          return;
        }

        const intentJson = await resIntent.json();
        console.log(
          "[booking-confirmation] Stripe clientSecret:",
          intentJson.clientSecret
        );
        setClientSecret(intentJson.clientSecret);
      } catch (e) {
        console.error("Unexpected error in booking confirmation page:", e);
        setLoadError("Unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    loadBookingAndIntent();
  }, [requestId]);

  const elementsOptions = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "stripe" as const,
        },
        locale: "en" as const,
      }
    : undefined;

  // ローディング or booking 取得前
  if (isLoading || !booking) {
    return (
      <main className="min-h-screen bg-[#f7f7f7] py-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 md:px-0">
          <h1 className="text-center text-2xl font-semibold text-[#1f2933]">
            Booking Confirmation
          </h1>
          {loadError ? (
            <p className="text-sm text-red-600">{loadError}</p>
          ) : (
            <p className="text-sm text-gray-700">Loading booking...</p>
          )}
        </div>
      </main>
    );
  }

  // ----- booking が取れたので UI に反映 -----
  const customerName =
    `${booking.customer.firstName} ${booking.customer.lastName}`.trim();

  const pickupDateTime = booking.preferredDatetime
    ? new Date(booking.preferredDatetime).toLocaleString()
    : "-";

  const pickupAddress = `${booking.pickupAddressLine1}${
    booking.pickupAddressLine2 ? ` ${booking.pickupAddressLine2}` : ""
  }, ${booking.pickupCity}, ${booking.pickupState} ${
    booking.pickupPostalCode ?? ""
  }`;

  const pickupNoteParts: string[] = [];
  if (booking.pickupFloor != null) {
    pickupNoteParts.push(`${booking.pickupFloor} floor`);
  }
  if (booking.pickupElevator === true) {
    pickupNoteParts.push("Elevator available");
  } else if (booking.pickupElevator === false) {
    pickupNoteParts.push("No elevator");
  }
  const pickupNote =
    pickupNoteParts.length > 0
      ? pickupNoteParts.join(" / ")
      : "No additional notes";

  const quotation = booking.quotation;

  return (
    <main className="min-h-screen bg-[#f7f7f7] py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 md:px-0">
        {/* Step indicator */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1a7c4c] bg-white text-sm font-semibold text-[#1a7c4c]">
                1
              </div>
              <span className="text-xs text-gray-600">Detail info</span>
            </div>

            <div className="h-px w-16 bg-gray-300" />

            <div className="flex flex-col items-center gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-sm font-semibold text-gray-400">
                2
              </div>
              <span className="text-xs text-gray-400">Payment info</span>
            </div>
          </div>
        </div>

        {/* Main 2-column layout */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left column – Request detail（実データ） */}
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-[#1a7c4c]">
              Request Number: {booking.id}
            </h2>

            <div className="space-y-1 text-sm leading-relaxed text-gray-800">
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
              <p className="mt-3">
                <span className="font-semibold">Pickup Date: </span>
                {pickupDateTime}
              </p>
              <p>
                <span className="font-semibold">Pickup Address: </span>
                {pickupAddress}
              </p>
              <p>
                <span className="font-semibold">Note: </span>
                {pickupNote}
              </p>
            </div>

            {/* Estimate */}
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
                    {booking.items.length > 0 ? (
                      booking.items.map((item, index) => (
                        <tr key={item.id}>
                          <td className="border-t px-3 py-2">{index + 1}</td>
                          <td className="border-t px-3 py-2">{item.name}</td>
                          <td className="border-t px-3 py-2">
                            {item.quantity}
                          </td>
                          <td className="border-t px-3 py-2">{item.size}</td>
                          <td className="border-t px-3 py-2">
                            {booking.deliveryRequired ? "Yes" : "No"}
                          </td>
                          <td className="border-t px-3 py-2">-</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          className="border-t px-3 py-2 text-center"
                          colSpan={6}
                        >
                          No items registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-col items-end text-sm text-gray-800">
                {quotation ? (
                  <>
                    <div className="flex w-40 justify-between">
                      <span>Sub Total:</span>
                      <span>${quotation.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex w-40 justify-between">
                      <span>Tax:</span>
                      <span>${quotation.tax.toFixed(2)}</span>
                    </div>
                    <div className="mt-1 flex w-40 justify-between font-semibold">
                      <span>Total:</span>
                      <span>${quotation.total.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-500">
                    Quotation is being prepared.
                  </p>
                )}
              </div>
            </div>

            {/* Discount code（現状はモックのまま保持でもOK） */}
            <div className="mt-8">
              <p className="mb-2 text-sm font-semibold text-gray-800">
                Discount Code
              </p>
              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1a7c4c] focus:ring-1 focus:ring-[#1a7c4c]"
                  defaultValue="UGM1212"
                />
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md bg-[#1a7c4c] px-4 py-2 text-sm font-medium text-white hover:bg-[#15603a]"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Cancellation policy */}
            <div className="mt-8 text-xs leading-relaxed text-gray-700">
              <p className="mb-4">
                Your payment will only be processed after the service is
                completed, once we issue the final invoice. You&apos;ll receive
                an email with the full breakdown before the charge is made.
              </p>

              <p className="mb-1 font-semibold">Cancellation Policy</p>
              <p className="mb-1">
                We understand that plans may change. Here&apos;s how
                cancellations work:
              </p>
              <p className="mb-1">
                <span className="font-semibold">Free cancellation</span> is
                available up to{" "}
                <span className="font-semibold">
                  24 hours before your scheduled pick-up time.
                </span>
              </p>
              <p>
                If you cancel within 24 hours of the scheduled pick-up,{" "}
                <span className="font-semibold">a cancellation fee of $25</span>{" "}
                will be charged to your registered credit card.
              </p>
            </div>
          </section>

          {/* Right column – Stripe Elements */}
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold text-[#1a7c4c]">
              Credit card Information
            </h3>

            <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span>Mastercard</span>
              <span>Visa</span>
              <span>American Express</span>
              <span>Discover</span>
              <span>UnionPay</span>
            </div>

            {loadError && (
              <p className="mb-3 text-sm text-red-600">{loadError}</p>
            )}

            {clientSecret && elementsOptions ? (
              <Elements stripe={stripePromise} options={elementsOptions}>
                <PaymentForm requestId={booking.id.toString()} />
              </Elements>
            ) : !loadError ? (
              <p className="text-sm text-gray-500">Loading payment form...</p>
            ) : null}

            {!clientSecret && !loadError && !isLoading && (
              <p className="mt-2 text-sm text-red-600">
                Failed to initialize payment. Please try again later.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
