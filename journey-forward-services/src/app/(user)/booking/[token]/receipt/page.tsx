import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function BookingReceiptPage({ params }: PageProps) {
  const { token } = await params;

  // トークンから予約情報を検索（存在確認のため）
  const quotation = await prisma.quotation.findFirst({
    where: { bookingLink: { contains: token } },
    include: { request: true },
  });

  if (!quotation || !quotation.request) return notFound();

  // 表示用にIDを取得
  const bookingId = quotation.request.id;

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
            contact our support team with your Request Number: {bookingId}.
          </p>
        </section>
      </div>
    </main>
  );
}
