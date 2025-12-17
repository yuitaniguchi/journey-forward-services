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
import DiscountForm, {
  ClientQuotation,
} from "@/components/booking/DiscountForm";

const CardBrandIcons = () => (
  <div className="mb-6">
    <img
      src="/card-brands.png"
      alt="Accepted Card Brands"
      className="w-full max-w-[320px] h-auto object-contain"
    />
  </div>
);

type Props = {
  booking: BookingRequest;
  token: string;
  clientSecret: string;
};

const mapToClientQuotation = (quotation: any): ClientQuotation | null => {
  if (!quotation) return null;
  return {
    id: quotation.id,
    subtotal: Number(quotation.subtotal),
    tax: Number(quotation.tax),
    total: Number(quotation.total),
    discountAmount: quotation.discountAmount
      ? Number(quotation.discountAmount)
      : null,
    discountCodeId: quotation.discountCodeId,
    discountCode: quotation.discountCode?.code ?? null,
    originalSubtotal:
      Number(quotation.originalSubtotal) || Number(quotation.subtotal),
    originalTax: Number(quotation.originalTax) || Number(quotation.tax),
    originalTotal: Number(quotation.originalTotal) || Number(quotation.total),
  };
};

function ConfirmPageContent({
  booking,
  token,
  clientSecret,
}: {
  booking: BookingRequest;
  token: string;
  clientSecret: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string | null>(
    (booking.quotation as any)?.discountCode?.code ?? null
  );

  const [currentQuotation, setCurrentQuotation] =
    useState<ClientQuotation | null>(mapToClientQuotation(booking.quotation));

  const [billingAddress, setBillingAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
  });

  const nextLink = `/booking/${token}/submitted`;

  const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;
  const pickupDateTime = new Date(booking.preferredDatetime).toLocaleString();
  const pickupAddress = `${booking.pickupAddressLine1}, ${booking.pickupCity}`;

  const quotation = currentQuotation;

  const handleQuotationUpdate = (
    newQuotation: ClientQuotation | null,
    successMessage: string | null,
    code: string | null
  ) => {
    setCurrentQuotation(newQuotation);
    setAppliedDiscountCode(code);
    setMessage(null);
  };

  const handleConfirm = async () => {
    if (!stripe || !elements) return;

    if (!agreed) {
      setMessage("Please agree to the cancellation policy.");
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      return;
    }

    if (
      !billingAddress.line1 ||
      !billingAddress.city ||
      !billingAddress.state ||
      !billingAddress.postal_code
    ) {
      setMessage("Please fill in all required fields for Billing Address.");
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const { setupIntent: retrievedIntent } =
        await stripe.retrieveSetupIntent(clientSecret);

      let paymentMethodId = "";

      if (retrievedIntent && retrievedIntent.status === "succeeded") {
        paymentMethodId =
          typeof retrievedIntent.payment_method === "string"
            ? retrievedIntent.payment_method
            : retrievedIntent.payment_method?.id || "";
      } else {
        const { error: submitError } = await elements.submit();
        if (submitError) {
          throw new Error(submitError.message ?? "Validation failed.");
        }

        const { error, setupIntent } = await stripe.confirmSetup({
          elements,
          redirect: "if_required",
          confirmParams: {
            return_url: window.location.href,
            payment_method_data: {
              billing_details: {
                name: customerName,
                address: {
                  line1: billingAddress.line1,
                  line2: billingAddress.line2 || undefined,
                  city: billingAddress.city,
                  state: billingAddress.state,
                  postal_code: billingAddress.postal_code,
                  country: "CA",
                },
              },
            },
          },
        });

        if (error) {
          throw error;
        }

        paymentMethodId =
          typeof setupIntent.payment_method === "string"
            ? setupIntent.payment_method
            : setupIntent.payment_method?.id || "";
      }

      const res = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: booking.id,
          paymentMethodId,
          discountCode: appliedDiscountCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm booking.");
      }

      window.location.href = nextLink;
    } catch (e: any) {
      setMessage(e.message || "Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const inputClassName =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-base text-black focus:border-[#1a7c4c] focus:outline-none focus:ring-1 focus:ring-[#1a7c4c]";

  return (
    <div className="min-h-screen bg-white text-black">
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
          Confirm your booking
        </h1>
      </section>

      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 md:px-0">
        <div className="grid gap-8 md:grid-cols-2">
          <section className="h-fit rounded-xl bg-white p-0 md:p-4">
            <h2 className="mb-6 text-2xl font-semibold text-[#1a7c4c]">
              Request Number: {booking.id}
            </h2>

            <div className="space-y-3 text-base text-black mb-8">
              <div>
                <span className="font-bold">Name:</span> {customerName}
              </div>
              <div>
                <span className="font-bold">Email:</span>{" "}
                {booking.customer.email}
              </div>
              <div>
                <span className="font-bold">Phone number:</span>{" "}
                {booking.customer.phone}
              </div>
              <div>
                <span className="font-bold" suppressHydrationWarning>
                  Pickup Date:
                </span>{" "}
                <span suppressHydrationWarning>{pickupDateTime}</span>
              </div>
              <div>
                <span className="font-bold">Pickup Address:</span>{" "}
                {pickupAddress}
              </div>

              {booking.deliveryRequired && (
                <div>
                  <span className="font-bold">Delivery Address:</span>{" "}
                  {booking.deliveryAddressLine1}, {booking.deliveryCity}
                </div>
              )}
            </div>

            <h3 className="mb-2 text-xl font-bold text-[#3F7253]">Estimate</h3>

            <div className="overflow-hidden rounded-t-lg border border-gray-200 mb-6">
              <table className="w-full text-left text-sm">
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
                      <td className="px-3 py-3 text-center text-black capitalize">
                        {item.size}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {quotation && (
              <div className="flex flex-col gap-6">
                <div className="w-full ml-auto md:w-64 space-y-2 text-right text-base">
                  <div className="flex justify-between font-bold text-black">
                    <span>Sub Total</span>
                    <span>${quotation.subtotal.toFixed(2)}</span>
                  </div>

                  {(quotation.discountAmount ?? 0) > 0 && (
                    <div className="flex justify-between font-bold text-[#FF4D4F]">
                      <span>Discount:</span>
                      <span>
                        -${(quotation.discountAmount ?? 0).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-black">
                    <span>Tax</span>
                    <span>${quotation.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-300 pt-2 text-lg font-black text-black">
                    <span>Total:</span>
                    <span>${quotation.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <DiscountForm
              requestId={booking.id}
              currentQuotation={quotation}
              onUpdateQuotation={handleQuotationUpdate}
            />
          </section>

          <section className="h-fit rounded-xl border-0 md:border md:border-gray-200 bg-white p-6 shadow-none md:shadow-sm md:p-8">
            <h3 className="mb-6 text-xl font-semibold text-[#1a7c4c]">
              Credit card Information
            </h3>
            <CardBrandIcons />

            <div className="mb-8">
              <PaymentElement
                options={{
                  layout: {
                    type: "accordion",
                    defaultCollapsed: false,
                    radios: false,
                    spacedAccordionItems: false,
                  },
                  fields: {
                    billingDetails: {
                      address: "never",
                    },
                  },
                }}
              />
            </div>

            <div>
              <h3 className="mb-4 text-base font-bold text-black">
                Billing Address <span className="text-red-500">*</span>
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Address Line 1"
                  className={inputClassName}
                  value={billingAddress.line1}
                  onChange={(e) =>
                    setBillingAddress({
                      ...billingAddress,
                      line1: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Address Line 2"
                  className={inputClassName}
                  value={billingAddress.line2}
                  onChange={(e) =>
                    setBillingAddress({
                      ...billingAddress,
                      line2: e.target.value,
                    })
                  }
                />
                <input
                  type="text"
                  placeholder="City"
                  className={inputClassName}
                  value={billingAddress.city}
                  onChange={(e) =>
                    setBillingAddress({
                      ...billingAddress,
                      city: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="State"
                  className={inputClassName}
                  value={billingAddress.state}
                  onChange={(e) =>
                    setBillingAddress({
                      ...billingAddress,
                      state: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Zip Code"
                  className={inputClassName}
                  value={billingAddress.postal_code}
                  onChange={(e) =>
                    setBillingAddress({
                      ...billingAddress,
                      postal_code: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
          </section>
        </div>

        <section className="mt-4">
          <div className="mb-6 text-base text-black">
            Your payment will only be processed after the service is completed,
            once we issue the final invoice. You'll receive an email with the
            full breakdown before the charge is made.
          </div>

          <div className="mb-6">
            <h4 className="mb-2 text-base font-bold text-black">
              Cancellation Policy
            </h4>
            <p className="mb-4 text-base text-black leading-relaxed">
              We understand that plans may change. Here’s how cancellations
              work:
              <br />
              <span className="font-bold">Free cancellation</span> is available
              up to <span className="font-bold">24 hours before</span> your
              scheduled pick-up time.
              <br />
              If you cancel within 24 hours of the scheduled pick-up,{" "}
              <span className="font-bold">a cancellation fee of $25</span> will
              be charged to your registered credit card.
            </p>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-[#367D5E] text-[#367D5E] focus:ring-[#367D5E] accent-[#367D5E]"
              />
              <span className="text-base text-black font-medium">
                I have read and agree to the cancellation policy.
              </span>
            </label>
          </div>

          {message && (
            <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {message}
            </p>
          )}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!stripe || isProcessing || !agreed}
              className="w-full md:w-auto min-w-[240px] rounded-md bg-[#1a7c4c] px-8 py-4 text-lg font-semibold text-white hover:bg-[#15603a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessing ? "Processing..." : "Confirm"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function BookingConfirmClient({
  booking,
  token,
  clientSecret,
}: Props) {
  const elementsOptions: any = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#000000",
            colorText: "#000000",
          },
          rules: {
            ".Tab": {
              border: "none",
              boxShadow: "none",
            },
            ".AccordionItem": {
              border: "none",
              boxShadow: "none",
            },
            ".Block": {
              border: "none",
              boxShadow: "none",
              backgroundColor: "transparent",
            },
          },
        },
        locale: "en",
      }
    : undefined;

  return (
    <main className="min-h-screen bg-white">
      {clientSecret && elementsOptions ? (
        <Elements stripe={stripePromise} options={elementsOptions}>
          <ConfirmPageContent
            booking={booking}
            token={token}
            clientSecret={clientSecret}
          />
        </Elements>
      ) : (
        <div className="flex h-[50vh] items-center justify-center">
          <p className="text-red-500 font-medium">
            Failed to initialize payment system. Please try reloading the page.
          </p>
        </div>
      )}
    </main>
  );
}
