import React from "react";

type PaymentConfirmationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PaymentConfirmationPage({
  params,
}: PaymentConfirmationPageProps) {
  // Next.js 16 では params が Promise になっているので await する
  const { id } = await params;
  const bookingId = id;

  // ひとまずモックデータ（後で API から取得する形に差し替え予定）
  const MOCK_EMAIL = "johnsmith@gmail.com";

  return (
    <main className="min-h-screen bg-[#f7f7f7] py-12">
      <div className="mx-auto max-w-5xl px-4 md:px-0">
        {/* ページタイトル */}
        <h1 className="mb-10 text-center text-2xl font-semibold text-[#1f2933] md:text-3xl">
          Booking Detail
        </h1>

        {/* 2カラムレイアウト */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* 左カラム：Thank you + ポリシー説明 */}
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold text-[#1a7c4c]">
              Thank you for Booking!
            </h2>

            <p className="mb-4 text-sm leading-relaxed text-gray-700">
              Thank you for confirming your booking with Journey Forward
              Services (JFS). We&apos;re happy to help you move things forward —
              whether that&apos;s through donation or delivery.
            </p>

            <div className="mb-5 space-y-2 text-sm leading-relaxed text-gray-700">
              <p className="font-semibold">When Will You Be Charged?</p>
              <p>
                Your payment will only be processed after the service is
                completed, once we issue the final invoice. You&apos;ll receive
                an email with the full breakdown before the charge is made.
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
                If you have any questions, feel free to reply to this email or
                call us. We&apos;re happy to help!
              </p>
            </div>
          </section>

          {/* 右カラム：Request 情報 & Estimate（Booking-confirmation の再利用イメージ） */}
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold text-[#1a7c4c]">
              Request Number: {bookingId}
            </h3>

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

            {/* Estimate セクション */}
            <div className="mt-8">
              <h4 className="text-sm font-semibold text-gray-800">Estimate</h4>
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

              {/* 金額サマリー（画像に近い形で） */}
              <div className="mt-4 flex flex-col items-end text-sm text-gray-800">
                <div className="flex w-40 justify-between text-red-600">
                  <span>Discount:</span>
                  <span>- $7.00</span>
                </div>
                <div className="flex w-40 justify-between">
                  <span>Sub Total:</span>
                  <span>$63.00</span>
                </div>
                <div className="flex w-40 justify-between">
                  <span>Tax:</span>
                  <span>$7.56</span>
                </div>
                <div className="mt-1 flex w-40 justify-between font-semibold">
                  <span>Total:</span>
                  <span>$70.56</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 下部：Free cancellation / Cancel this Booking ボタン */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="text-center text-sm font-semibold text-[#e4572e]">
            Free cancellation up to 8:59 AM,
            <br />
            Aug 13, 2025
          </p>

          <button
            type="button"
            className="rounded-full bg-[#1a7c4c] px-6 py-2 text-sm font-semibold text-white hover:bg-[#15603a]"
          >
            Cancel this Booking
          </button>
        </div>
      </div>
    </main>
  );
}
