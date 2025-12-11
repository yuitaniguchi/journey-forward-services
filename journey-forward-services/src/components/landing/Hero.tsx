"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden pt-10 md:pt-16 pb-16"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero-van.webp"
          alt="Journey Forward crew"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/10" />
      </div>

      <div className="section-inner relative z-10">
        <div className="max-w-[640px] space-y-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
            <span className="text-brand">Quickly</span> book and
            <br />
            clear out unwanted items
          </h1>

          <p className="max-w-md text-sm md:text-base text-slate-600">
            Book your junk removal or delivery service in minutes.
          </p>
        </div>
      </div>
    </section>
  );
}
