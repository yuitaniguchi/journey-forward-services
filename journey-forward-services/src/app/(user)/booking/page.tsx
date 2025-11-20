"use client";

import BookingForm from "@/components/forms/BookingForm";

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-[#f5f7f5]">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <h1 className="text-center text-3xl md:text-4xl font-semibold text-[#1f2933]">
            Get an Estimate
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <BookingForm />
      </section>
    </main>
  );
}
