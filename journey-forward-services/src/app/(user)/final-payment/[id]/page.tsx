"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Booking = {
  id: number;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  quotation: {
    subtotal: string;
    tax: string;
    total: string;
  } | null;
  payment: {
    status: string;
    total: string;
    currency: string;
  } | null;
};

export default function FinalPaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const requestId = params?.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(true);

  const [isCreatingPi, setIsCreatingPi] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) return;

    const loadBookingAndPi = async () => {
      try {
        setIsLoadingBooking(true);
        setErrorMessage(null);

        // 1. Booking 情報を取得
        const resBooking = await fetch(`/api/bookings/${requestId}`);
        if (!resBooking.ok) {
          const text = await resBooking.text();
          console.error("Failed to fetch booking", resBooking.status, text);
          setErrorMessage("Failed to load booking information.");
          return;
        }
        const json = await resBooking.json();
        setBooking(json.data);

        // 2. PaymentIntent を作成（または再利用）
        setIsCreatingPi(true);
        const resPi = await fetch("/api/payments/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requestId }),
        });

        if (!resPi.ok) {
          const text = await resPi.text();
          console.error("Failed to create payment intent", resPi.status, text);
          setErrorMessage("Failed to initialize payment.");
          return;
        }

        const piJson = await resPi.json();
        console.log(
          "[final-payment] PaymentIntent prepared:",
          piJson.paymentIntentId
        );
      } catch (err) {
        console.error("Unexpected error in final payment page:", err);
        setErrorMessage("Unexpected error occurred.");
      } finally {
        setIsLoadingBooking(false);
        setIsCreatingPi(false);
      }
    };

    loadBookingAndPi();
  }, [requestId]);

  const handleConfirmPayment = async () => {
    if (!requestId) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsConfirming(true);

    try {
      const res = await fetch("/api/payments/confirm-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to confirm payment", res.status, text);
        setErrorMessage("Failed to confirm payment. Please try again.");
        return;
      }

      const data = await res.json();
      console.log(
        "[final-payment] confirm-payment result:",
        data.paymentIntentId,
        data.status
      );

      // 一旦ここでは成功メッセージを表示＋完了ページへ遷移
      setSuccessMessage("Payment has been processed successfully.");
      router.push(`/payment-confirmation/${requestId}`);
    } catch (err) {
      console.error("Unexpected error while confirming payment:", err);
      setErrorMessage("Unexpected error during payment.");
    } finally {
      setIsConfirming(false);
    }
  };

  if (!requestId) {
    return (
      <main className="min-h-screen bg-[#f7f7f7] py-12">
        <div className="mx-auto max-w-5xl px-4 md:px-0">
          <p className="text-sm text-red-600">
            Invalid URL. Request ID is missing.
          </p>
        </div>
      </main>
    );
  }

  if (isLoadingBooking || !booking) {
    return (
      <main className="min-h-screen bg-[#f7f7f7] py-12">
        <div className="mx-auto max-w-5xl px-4 md:px-0">
          <p className="text-sm text-gray-700">Loading booking...</p>
        </div>
      </main>
    );
  }

  const fullName = `${booking.customer.firstName} ${booking.customer.lastName}`;
  const email = booking.customer.email;
  const subtotal = booking.quotation?.subtotal ?? "0.00";
  const tax = booking.quotation?.tax ?? "0.00";
  const total = booking.quotation?.total ?? booking.payment?.total ?? "0.00"; // 一旦 quotation 優先で表示

  return (
    <main className="min-h-screen bg-[#f7f7f7] py-12">
      <div className="mx-auto max-w-5xl px-4 md:px-0">
        <h1 className="mb-10 text-center text-2xl font-semibold text-[#1f2933] md:text-3xl">
          Booking Detail
        </h1>

        {/* メッセージ表示 */}
        {errorMessage && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        {/* 2カラム */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* 左カラム：Thank you ＋ ポリシー */}
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold text-[#1a7c4c]">
              Thank you for Booking!
            </h2>

            <p className="mb-4 text-sm leading-relaxed text-gray-700">
              Please review your booking details and confirm the final payment.
              Your card will be charged only after you approve this amount.
            </p>

            <div className="mb-5 space-y-2 text-sm leading-relaxed text-gray-700">
              <p className="font-semibold">When Will You Be Charged?</p>
              <p>
                Your payment will be processed after you confirm this final
                amount. You&apos;ll receive an email with the full breakdown
                once the charge is completed.
              </p>
            </div>

            <div className="mb-5 space-y-2 text-sm leading-relaxed text-gray-700">
              <p className="font-semibold">Cancellation Policy</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <span className="font-semibold">Free cancellation</span> is
                  available up to{" "}
                  <span className="font-semibold">
                    24 hours before your scheduled pick-up time.
                  </span>
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

            <div className="space-y-2 text-sm leading-relaxed text-gray-700">
              <p className="font-semibold">Questions?</p>
              <p>
                If you have any questions, feel free to reply to the email you
                received or contact us directly.
              </p>
            </div>
          </section>

          {/* 右カラム：実際の Booking 情報 */}
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold text-[#1a7c4c]">
              Request Number: {booking.id}
            </h3>

            <div className="space-y-1 text-sm leading-relaxed text-gray-800">
              <p>
                <span className="font-semibold">Name: </span>
                {fullName}
              </p>
              <p>
                <span className="font-semibold">Email: </span>
                {email}
              </p>
              {booking.customer.phone && (
                <p>
                  <span className="font-semibold">Phone: </span>
                  {booking.customer.phone}
                </p>
              )}
            </div>

            {/* Estimate（ここはあとで Items / Quotation に差し替え） */}
            <div className="mt-8">
              <h4 className="text-sm font-semibold text-gray-800">Estimate</h4>
              <p className="mt-1 text-xs text-gray-500">
                Final amount to be charged to your card.
              </p>

              <div className="mt-4 overflow-hidden rounded-md border border-gray-200 text-xs">
                <table className="min-w-full border-collapse">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">
                        Description
                      </th>
                      <th className="px-3 py-2 text-right font-semibold">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white text-gray-800">
                    <tr>
                      <td className="border-t px-3 py-2">Subtotal</td>
                      <td className="border-t px-3 py-2 text-right">
                        ${subtotal}
                      </td>
                    </tr>
                    <tr>
                      <td className="border-t px-3 py-2">Tax</td>
                      <td className="border-t px-3 py-2 text-right">${tax}</td>
                    </tr>
                    <tr>
                      <td className="border-t px-3 py-2 font-semibold">
                        Total
                      </td>
                      <td className="border-t px-3 py-2 text-right font-semibold">
                        ${total}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Confirm Payment ボタン */}
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isCreatingPi || isConfirming}
                className="mt-6 flex w-full items-center justify-center rounded-full bg-[#1a7c4c] px-6 py-3 text-sm font-semibold text-white hover:bg-[#15603a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isConfirming ? "Processing payment..." : "Confirm Payment"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
