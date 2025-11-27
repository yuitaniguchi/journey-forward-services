"use client";

import { useCallback } from "react";

type BookingConfirmationPageProps = {
  params: {
    id: string;
  };
};

export default function BookingConfirmationPage({
  params,
}: BookingConfirmationPageProps) {
  const handleConfirm = useCallback(() => {
    console.log("go to payment", params.id);
    // 後でここで Stripe 決済フローを呼び出す
  }, [params.id]);

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
              Request Number: {params.id ?? "342673"}
            </h2>

            <div className="space-y-1 text-sm leading-relaxed text-gray-800">
              <p>
                <span className="font-semibold">Name: </span>John Smith
              </p>
              <p>
                <span className="font-semibold">Email: </span>
                johnsmith@gmail.com
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

            {/* Agree checkbox */}
            <div className="mt-6 flex items-start gap-3 text-xs text-gray-800">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-400 accent-[#1a7c4c]"
              />
              <p>
                I have read and agree to the cancellation policy, including any
                applicable cancellation fees for late cancellations.
              </p>
            </div>

            {/* Confirm button */}
            <div className="mt-8">
              <button
                type="button"
                onClick={handleConfirm}
                className="flex w-full items-center justify-center rounded-full bg-[#1a7c4c] px-6 py-3 text-sm font-semibold text-white hover:bg-[#15603a]"
              >
                Confirm
              </button>
            </div>
          </section>

          {/* Right column – Payment (ダミー UI、後で Stripe をはめ込む) */}
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

            <div className="mb-4 space-y-1 text-sm">
              <label className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">
                  Name <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1a7c4c] focus:ring-1 focus:ring-[#1a7c4c]"
                placeholder="Name"
              />
            </div>

            <div className="mb-4 space-y-1 text-sm">
              <label className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">
                  Card number <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                className="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1a7c4c] focus:ring-1 focus:ring-[#1a7c4c]"
                placeholder="XXXX-XXXX-XXXX"
              />
              <div className="flex gap-2">
                <input
                  className="w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1a7c4c] focus:ring-1 focus:ring-[#1a7c4c]"
                  placeholder="MM / YY"
                />
                <input
                  className="w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1a7c4c] focus:ring-1 focus:ring-[#1a7c4c]"
                  placeholder="CVC"
                />
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <p className="font-semibold text-gray-700">
                Billing Address <span className="text-red-500">*</span>
              </p>

              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1a7c4c] focus:ring-1 focus:ring-[#1a7c4c]"
                placeholder="Address Line 1"
              />
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1a7c4c] focus:ring-1 focus:ring-[#1a7c4c]"
                placeholder="Address Line 2"
              />
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1a7c4c] focus:ring-1 focus:ring-[#1a7c4c]"
                placeholder="City"
              />
              <div className="flex gap-2">
                <input
                  className="w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1a7c4c] focus:ring-1 focus:ring-[#1a7c4c]"
                  placeholder="State"
                />
                <input
                  className="w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1a7c4c] focus:ring-1 focus:ring-[#1a7c4c]"
                  placeholder="Zip Code"
                />
              </div>
            </div>

            <div className="mt-8 rounded-md border border-dashed border-gray-300 p-4 text-xs text-gray-500">
              Stripe Elements をここに埋め込む予定のスペース
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
