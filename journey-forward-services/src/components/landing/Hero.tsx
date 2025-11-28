'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden pt-10 md:pt-16 pb-16"
    >
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero-van.webp" // image in /public
          alt="Journey Forward crew"
          fill
          priority
          className="object-cover"
        />
        {/* White gradient overlay to match Figma */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/10" />
      </div>

      {/* Content on top of image */}
      <div className="section-inner relative z-10">
        <div className="max-w-xl space-y-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            JOURNEY FORWARD SERVICES
          </p>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
            <span className="text-brand">Quickly</span> book and
            <br />
            clear out unwanted items
          </h1>

          <p className="max-w-md text-sm md:text-base text-slate-600">
            Book your junk removal or delivery service in minutes.
          </p>

          {/* Postal code card (white card over image) */}
          <div className="mt-4 bg-white/95 backdrop-blur-sm shadow-lg border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:p-5">
            <div className="flex-1">
              <label
                htmlFor="postal-code"
                className="block text-xs font-medium text-slate-500 mb-1"
              >
                Postal code
              </label>
              <input
                id="postal-code"
                placeholder="Check if your location is available"
                className="w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <Button className="w-full md:w-auto rounded-full bg-brand px-8 py-2.5 text-sm font-medium text-white hover:bg-brand-dark">
              Check Availability
            </Button>
          </div>

          <p className="text-[11px] text-slate-400">
            *We currently serve the Greater Vancouver area only.
          </p>
        </div>
      </div>
    </section>
  );
}
