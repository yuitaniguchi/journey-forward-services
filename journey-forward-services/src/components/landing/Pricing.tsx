'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

const tiers = [
  {
    label: 'Minimum truckload',
    points: [
      'Small appliances',
      'Computer/computer monitor',
      'Any size mattress',
      'Any furniture',
    ],
    img: '/price-minimum.webp',
  },
  {
    label: 'Half truckload',
    points: [
      'Eight standard sized refrigerators',
      'Six full-sized three-seater sofas',
      'Great for garage cleanouts',
      'Any furniture',
    ],
    img: '/price-minimum-3.webp',
  },
  {
    label: 'Full truckload',
    points: [
      'Great for big home moveouts',
      'Six full-sized three-seater sofas',
      'Great for garage cleanouts',
      'Any furniture',
    ],
    img: '/price-half-2.webp',
  },
];

export default function Pricing() {
  return (
    <>
      {/* 1) ABOUT SECTION */}
      <section className="bg-white py-16 md:py-20">
        <div className="section-inner grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[520px]">
              <Image
                src="/ruck-hero.webp"
                alt="Journey Forward truck"
                width={800}
                height={480}
                className="h-auto w-full object-contain"
                priority
              />
            </div>
          </div>

          <div className="max-w-xl lg:ml-auto space-y-5">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-snug">
              Enjoy a better way
              <br />
              to <span className="text-brand">clear out clutter</span>
            </h2>

            <p className="text-sm md:text-[15px] text-slate-600 leading-relaxed">
              We make your space shine! Professional and reliable pick-up
              service providing top-notch solutions for homes and businesses.
              Satisfaction guaranteed.
            </p>

            <div className="grid grid-cols-2 gap-y-2 gap-x-10 text-sm text-slate-700">
              <div>• No hidden fee</div>
              <div>• Expert agent</div>
              <div>• Partner perks</div>
              <div>• 24/7 Booking</div>
              <div>• Sustainable approach</div>
              <div>• Affordable prices</div>
            </div>

            <Link href="/booking">
              <Button className="mt-4 bg-brand px-7 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark ">
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2) PRICING SECTION */}
      <section className="bg-brand-dark/90 py-16 text-white">
        <div className="section-inner space-y-8">
          <h3 className="text-center text-xl md:text-2xl font-semibold">
            We price based on volume
          </h3>

          <div className="grid gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <Card
                key={tier.label}
                className="card-elevated border-none bg-white text-slate-900 rounded-3xl"
              >
                <CardContent className="space-y-4 p-6">
                  <p className="inline-block rounded-full border border-brand/15 bg-brand/5 px-3 py-1 text-[11px] font-medium text-brand">
                    {tier.label}
                  </p>

                  {/* FIXED IMAGE WRAPPER */}
                  <div className="flex justify-center items-center h-28 rounded-xl overflow-hidden">
                    <Image
                      src={tier.img}
                      alt={tier.label}
                      width={300}
                      height={150}
                      className="object-contain max-h-full"
                      draggable="false"
                    />
                  </div>

                  <ul className="mt-2 space-y-1 text-xs text-slate-600">
                    {tier.points.map((p) => (
                      <li key={p}>• {p}</li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <Link href="/booking" className="w-full">
                    <Button className="w-full bg-brand text-sm font-semibold text-white hover:bg-brand-dark ">
                      Get an Estimate
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
