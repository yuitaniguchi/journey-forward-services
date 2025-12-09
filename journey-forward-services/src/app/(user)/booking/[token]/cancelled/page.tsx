import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Check } from "lucide-react";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function BookingCancelledPage({ params }: PageProps) {
  const { token } = await params;

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
    <main className="min-h-screen bg-white flex flex-col items-center justify-center py-16">
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-[#367D5E] to-[#53C090] shadow-md">
          <Check className="h-8 w-8 text-white stroke-[3]" />
        </div>

        {/* Title */}
        <h1 className="mb-3 text-2xl font-bold text-[#22503B]">
          Your booking has been canceled.
        </h1>

        {/* Request Number */}
        <p className="mb-6 text-lg font-bold text-[#22503B]">
          Request Number: <span className="text-[#22503B]">{booking.id}</span>
        </p>

        {/* Subtitle / Status Label */}
        <p className="mb-4 text-xs font-medium text-slate-500 uppercase tracking-wide">
          Cancellation Processed
        </p>

        {/* Description */}
        <p className="mb-10 text-sm leading-relaxed text-slate-600">
          If this cancellation was made by mistake or if you have any questions,
          please contact our support team and provide your Request Number.
        </p>

        {/* Button Style Link */}
        <Link
          href="/"
          className="min-w-[180px] inline-flex items-center justify-center rounded-md bg-[#367D5E] px-6 py-2 text-sm font-medium text-white hover:bg-[#2e563d] transition-all shadow-sm"
        >
          Go to Main Page
        </Link>
      </div>
    </main>
  );
}
