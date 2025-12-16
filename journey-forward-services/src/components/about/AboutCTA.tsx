"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutCTA() {
  return (
    <section className="bg-white pt-16 md:pt-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col-reverse items-center gap-8 md:flex-row md:gap-16">
          {/* IMAGE SECTION */}
          {/* Mobile: Bottom, Desktop: Left */}
          <div className="relative h-[300px] w-full max-w-[340px] md:h-[500px] md:max-w-[480px] md:flex-1">
            <Image
              src="/about/about-cta-person.png"
              alt="Mover carrying box"
              fill
              className="object-contain object-bottom md:object-left"
              priority
            />
          </div>

          {/* TEXT & BUTTONS SECTION */}
          {/* Mobile: Top, Desktop: Right */}
          <div className="flex flex-col items-center text-center md:flex-1 md:items-start md:text-left">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl md:leading-tight">
              Ready to take an action?
            </h2>

            <p className="mb-8 max-w-md text-base text-slate-600 md:text-lg">
              your support helps reduce waste, create jobs,
              <br className="hidden md:block" /> and give someone a second
              chance at life.
            </p>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              {/* Contact Button (Outline) */}
              <Link href="/contact" className="w-full sm:w-auto">
                <Button className="w-full rounded-md border border-[#367D5E] bg-white px-8 py-6 text-base font-semibold text-[#367D5E] hover:bg-[#367D5E]/10">
                  Contact
                </Button>
              </Link>

              {/* Get an Estimate Button (Solid) */}
              <Link href="/booking" className="w-full sm:w-auto">
                <Button className="w-full rounded-md bg-[#367D5E] px-8 py-6 text-base font-semibold text-white shadow-md hover:bg-[#2b644b]">
                  Get an Estimate
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
