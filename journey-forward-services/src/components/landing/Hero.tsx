'use client';

import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section id="home" className="section pt-10 md:pt-16">
      <div className="section-inner grid gap-10 md:grid-cols-[1.1fr,1.2fr] items-center">
        {/* Left: text + postal code box */}
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
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

          {/* Postal code card */}
          <div className="card-elevated mt-4 flex flex-col gap-3 p-4 md:flex-row md:items-center md:p-5">
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

            <Button className="mt-1 w-full rounded-full bg-brand text-sm font-medium text-white md:mt-0 md:w-auto px-6 py-2.5 hover:bg-brand-dark">
              Check Availability
            </Button>
          </div>

          <p className="text-[11px] text-slate-400">
            *We currently serve the Greater Vancouver area only.
          </p>
        </div>

        {/* Right: hero image */}
        <div className="relative h-[260px] overflow-hidden rounded-3xl bg-slate-200 md:h-[360px] lg:h-[420px]">
          {/* For now just use a plain <img>. Replace src with your real image path */}
          <img
            src="/images/hero-van.jpg"
            alt="Journey Forward crew"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
