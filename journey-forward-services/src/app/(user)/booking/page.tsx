"use client";

import React, { useState, Suspense } from "react";
import BookingForm from "@/components/forms/BookingForm";

export default function BookingPage() {
  const [isCompleted, setIsCompleted] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      {!isCompleted && (
        <section className="relative hidden w-full items-center justify-center overflow-hidden border-b border-slate-100 bg-[#F5F5F5] py-10 md:flex md:py-14">
          <div
            className="absolute inset-0 z-0 opacity-20"
            style={{
              backgroundImage: "url('/header-pattern.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />

          <h1 className="relative z-10 text-center text-3xl font-bold text-[#1f2933] md:text-5xl">
            Get an Estimate
          </h1>
        </section>
      )}

      <section className="mx-auto max-w-4xl px-0 py-0 md:px-4 md:py-12">
        <Suspense fallback={<div>Loading form...</div>}>
          <BookingForm onComplete={() => setIsCompleted(true)} />
        </Suspense>
      </section>
    </main>
  );
}
