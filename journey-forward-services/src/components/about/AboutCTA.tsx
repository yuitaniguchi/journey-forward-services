'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutCTA() {
  return (
    <section className=" bg-white py-16 md:py-20">
      <div className="section-inner">
        {/* White card with same general shape as the rest of the site */}
        <div className=" border border-slate-200 bg-white px-8 py-10 md:px-12 md:py-12 shadow-sm">
          {/* Layout: image on the LEFT, text on the RIGHT */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-10">
            {/* IMAGE – big, zoomed, left-aligned just like Figma */}
            <div className="relative md:flex-none md:w-[380px] h-[320px] md:h-[340px] -ml-4 md:-ml-8 overflow-hidden">
              <Image
                src="/about-cta-person.webp.webp"
                alt="Mover carrying box"
                fill
                className="object-cover object-left"
                priority
              />
            </div>

            {/* TEXT + BUTTONS */}
            <div className="mt-8 md:mt-0 md:flex-1 md:pl-4 space-y-5">
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
                Ready to take an action?
              </h2>

              <p className="max-w-md text-sm md:text-base text-slate-600 leading-relaxed">
                Your support helps reduce waste, create jobs, and give someone a
                second chance at life.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                {/* Contact – outline */}
                <Link href="/contact">
                  <Button className="rounded-md border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-800 shadow-none hover:bg-slate-50">
                    Contact
                  </Button>
                </Link>

                {/* Get an Estimate – SAME style as navbar CTA */}
                <Link href="/booking">
                  <Button className="rounded-md bg-brand px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark">
                    Get an Estimate
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
