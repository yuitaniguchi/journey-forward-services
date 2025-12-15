"use client";

import { Check } from "lucide-react";

export default function WhatWeOffer() {
  return (
    <section className="bg-[#F7F7F7] py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Heading */}
        <div className="mb-16 space-y-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            What we offer
          </h2>
          <p className="mx-auto max-w-xl text-sm text-slate-500 md:text-base">
            Your support doesn&apos;t just clean a space
            <br className="hidden md:inline" /> — it helps someone journey
            forward.
          </p>
        </div>

        {/* 3-column Layout */}
        <div className="grid gap-8 md:grid-cols-3 items-start">
          {/* COLUMN 1: Junk Removal */}
          <div className="flex flex-col gap-5 md:flex-col-reverse">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 rounded-md bg-white px-5 py-3 w-fit">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F9B301]">
                  <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
                </div>
                <span className="text-sm font-bold text-slate-900">
                  Junk Removal
                </span>
              </div>
              <p className="text-xs md:text-sm leading-relaxed text-slate-600">
                picks up and disposes of unwanted items like furniture,
                appliances, and trash from homes or businesses. It saves time,
                supports recycling, and clears clutter fast.
              </p>
            </div>

            {/* Image */}
            <div className="relative h-[320px] md:h-[400px] w-full overflow-hidden rounded-md">
              <img
                src="/about/movers2.webp"
                alt="Junk Removal"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* COLUMN 2: Pick-up Service */}
          <div className="flex flex-col gap-5">
            {/* Content */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 rounded-md bg-white px-5 py-3 w-fit">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F9B301]">
                  <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
                </div>
                <span className="text-sm font-bold text-slate-900">
                  Pick-up Service
                </span>
              </div>
              <p className="text-xs md:text-sm leading-relaxed text-slate-600">
                We pick up items — from furniture and donations to large
                deliveries — and transport them from point A to B, hassle-free.
              </p>
            </div>

            {/* Image */}
            <div className="relative h-[320px] md:h-[400px] w-full overflow-hidden rounded-md">
              <img
                src="/about/movers3.webp"
                alt="Pick-up Service"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* COLUMN 3: Delivery Service */}
          <div className="flex flex-col gap-5 md:flex-col-reverse">
            {/* Content */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 rounded-md bg-white px-5 py-3 w-fit">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F9B301]">
                  <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
                </div>
                <span className="text-sm font-bold text-slate-900">
                  Delivery Service
                </span>
              </div>
              <p className="text-xs md:text-sm leading-relaxed text-slate-600">
                transports items—like furniture, appliances, or packages—from
                one location to another. It&apos;s fast, convenient, and often
                includes loading, unloading, and setup.
              </p>
            </div>

            {/* Image */}
            <div className="relative h-[320px] md:h-[400px] w-full overflow-hidden rounded-md">
              <img
                src="/about/movers1.webp"
                alt="Delivery Service"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
