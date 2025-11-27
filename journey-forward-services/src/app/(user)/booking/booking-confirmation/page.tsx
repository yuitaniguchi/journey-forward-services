// src/app/(user)/booking/booking-confirmation/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripeClient";

const MOCK_BOOKING_ID = "342673"; // ひとまず固定。後で本物の予約IDに差し替え予定
const MOCK_EMAIL = "johnsmith@gmail.com";

function PaymentForm({ bookingId }: { bookingId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
      // redirect が必要なカード（3Dセキュア等）のときだけ Stripe 側に飛ぶ
      // 必要に応じて return_url を設定してもOK
      // confirmParams: {
      //   return_url: `${window.location.origin}/payment-confirmation/${bookingId}`,
      // },
    });

    setIsProcessing(false);

    if (error) {
      console.error("confirmSetup error:", error);
      setErrorMessage(error.message ?? "Something went wrong.");
      return;
    }

    console.log("Setup succeeded ✅", setupIntent?.id);
    // TODO: ここでバックエンドに「カード登録完了」を通知したり、
    // /payment-confirmation/[id] に router.push したりする
    alert("Card has been saved (authorized) successfully!");
  };

  return (
    <>
      {/* 本物のカードフォーム */}
      <div className="mb-6">
        <PaymentElement />
      </div>

      {errorMessage && (
        <p className="mb-3 text-sm text-red-600">{errorMessage}</p>
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
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(true);

  // ページ表示時に Intent を作成して clientSecret を取得
  useEffect(() => {
    const createIntent = async () => {
      try {
        const res = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId: MOCK_BOOKING_ID,
            customerEmail: MOCK_EMAIL,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to create intent", res.status, text);
          return;
        }

        const data = await res.json();
        console.log("Stripe clientSecret (from useEffect):", data.clientSecret);
        setClientSecret(data.clientSecret);
      } catch (e) {
        console.error("Unexpected error while creating intent", e);
      } finally {
        setLoadingIntent(false);
      }
    };

    createIntent();
  }, []);

  const elementsOptions = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "stripe" as const,
        },
      }
    : undefined;

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
          {/* Left column – Request detail */}
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-[#1a7c4c]">
              Request Number: {MOCK_BOOKING_ID}
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

            {/* Estimate */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-800">Estimate</h3>
              <p className="mt-1 text-xs text-gray-500">
                Minimum location fee: $50
              </p>

              {/* Items table */}
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

              {/* Totals */}
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

            {/* Discount code */}
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

          {/* Right column – Stripe Elements 埋め込み */}
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold text-[#1a7c4c]">
              Credit card Information
            </h3>

            {/* ブランド表示はシンプルにテキストだけ残す */}
            <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span>Mastercard</span>
              <span>Visa</span>
              <span>American Express</span>
              <span>Discover</span>
              <span>UnionPay</span>
            </div>

            {loadingIntent && (
              <p className="text-sm text-gray-500">Loading payment form...</p>
            )}

            {!loadingIntent && clientSecret && elementsOptions && (
              <Elements stripe={stripePromise} options={elementsOptions}>
                <PaymentForm bookingId={MOCK_BOOKING_ID} />
              </Elements>
            )}

            {!loadingIntent && !clientSecret && (
              <p className="text-sm text-red-600">
                Failed to initialize payment. Please try again later.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
