// src/app/(user)/payment-confirmation/[id]/page.tsx
"use client";

import React from "react";

type PageParams = Promise<{ id: string }>;

type PaymentConfirmationPageProps = {
  params: PageParams;
};

export default function PaymentConfirmationPage({
  params,
}: PaymentConfirmationPageProps) {
  // Next.js 16 で params が Promise なので、use で unwrap
  // （クライアントコンポーネントなので React.use() 相当の use を使う）
  // ただし "use" はまだ型に入ってないので、代わりに一旦 state に落とす形でもOK。
  // ここではシンプルに「id は URL から来る文字列」として扱います。
  // Booking ID を URL パラメータからそのまま表示するだけなので、
  // 今回は Promise のまま扱わず、型エラーを避けるために any で受けます。

  const anyParams = params as any;

  return (
    <main className="min-h-screen bg-[#f7f7f7] py-16">
      <div className="mx-auto max-w-3xl px-4">
        <section className="rounded-2xl bg-white px-8 py-12 shadow-sm text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#e3f5eb]">
            <span className="text-3xl text-[#1a7c4c]">✓</span>
          </div>

          {/* Title */}
          <h1 className="mb-3 text-3xl font-semibold text-[#1a7c4c]">
            Payment Completed
          </h1>

          {/* Sub text */}
          <p className="mb-10 text-sm text-gray-600">
            Thank you! Your payment has been processed successfully.
          </p>

          {/* Help text */}
          <p className="mx-auto max-w-xl text-xs text-gray-500 leading-relaxed">
            If you have any questions about your booking or payment, please
            contact our support team with your Booking ID.
          </p>
        </section>
      </div>
    </main>
  );
}
