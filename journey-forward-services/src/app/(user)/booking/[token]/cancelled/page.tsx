import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function BookingCancelledPage({ params }: PageProps) {
  const { token } = await params;

  // トークンから予約情報を取得
  const quotation = await prisma.quotation.findFirst({
    where: {
      bookingLink: {
        contains: token,
      },
    },
    include: {
      request: true,
    },
  });

  if (!quotation || !quotation.request) {
    return notFound();
  }

  const booking = quotation.request;

  return (
    <main className="min-h-screen bg-[#f7f7f7] py-16">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center">
        {/* Icon */}
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#e3f5eb]">
          <span className="text-3xl text-[#1a7c4c]">✓</span>
        </div>

        {/* Title */}
        <h1 className="mb-3 text-3xl font-semibold text-[#1f4733]">
          Your booking has been canceled.
        </h1>

        {/* Request Number */}
        <p className="mb-10 text-lg font-semibold text-[#1f4733]">
          Request Number: {booking.id}
        </p>

        {/* 説明文 */}
        <p className="mb-10 max-w-xl text-sm leading-relaxed text-gray-600">
          If this cancellation was made by mistake or if you have any questions,
          please contact our support team and provide your Request Number.
        </p>

        {/* Go to Main Page ボタン */}
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-[#2f6f4e] px-8 py-3 text-sm font-semibold text-white hover:bg-[#25563d] focus:outline-none focus:ring-2 focus:ring-[#2f6f4e] focus:ring-offset-2"
        >
          Go to Main Page
        </Link>
      </div>
    </main>
  );
}
