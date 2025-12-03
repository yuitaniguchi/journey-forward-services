'use client';

export default function WhatWeOffer() {
  return (
    <section className="section bg-white py-20">
      <div className="section-inner">
        {/* Heading */}
        <div className="mb-12 space-y-2 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-brand-dark">
            What we offer
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            Your support doesn&apos;t just clean a space—help someone journey
            forward.
          </p>
        </div>

        {/* 3-column services */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* LEFT CARD – (IMAGE ON TOP) */}
          <div className="flex flex-col overflow-hidden bg-white shadow-card">
            <div className="relative h-64 md:h-72 w-full">
              <img
                src="/movers2.webp"
                alt="Junk Removal"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-2 px-6 py-5">
              <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-800">
                <span className="inline-block h-2 w-2 rounded-full bg-accent-yellow" />
                Junk Removal
              </p>
              <p className="text-[11px] md:text-xs leading-relaxed text-slate-600">
                Picks up and disposes of unwanted items like furniture,
                appliances, and trash from homes or businesses.
              </p>
            </div>
          </div>

          {/* MIDDLE CARD – (TEXT ON TOP, IMAGE BELOW) */}
          <div className="flex flex-col overflow-hidden  bg-white shadow-card">
            <div className="space-y-2 px-6 pt-6 pb-4">
              <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-800">
                <span className="inline-block h-2 w-2  bg-accent-yellow" />
                Pick-up Service
              </p>
              <p className="text-[11px] md:text-xs leading-relaxed text-slate-600">
                We pick up items—from furniture and donations to large
                deliveries—and transport them from point A to B, hassle-free.
              </p>
            </div>

            <div className="relative mt-2 h-56 md:h-64 w-full">
              <img
                src="/movers3.webp"
                alt="Pick-up Service"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* RIGHT CARD – NOW MATCHES CARD 1 (IMAGE ON TOP, TEXT BELOW) */}
          <div className="flex flex-col overflow-hidden  bg-white shadow-card">
            <div className="relative h-64 md:h-72 w-full">
              <img
                src="/movers1.webp"
                alt="Delivery Service"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-2 px-6 py-5">
              <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-800">
                <span className="inline-block h-2 w-2 bg-accent-yellow" />
                Delivery Service
              </p>
              <p className="text-[11px] md:text-xs leading-relaxed text-slate-600">
                Transports items like furniture, appliances, or packages from
                one location to another—fast, convenient, and handled with care.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
