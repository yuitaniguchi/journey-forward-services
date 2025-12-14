"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

function CheckIcon() {
  return (
    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFC107]">
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 3L4.5 8.5L2 6"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

const features = [
  "No hidden fee",
  "Expert agent",
  "Partner perks",
  "24/7 Booking",
  "Sustainable approach",
  "Affordable Prices",
];

const tiers = [
  {
    label: "Minimum truckload",
    points: [
      "Small appliances",
      "Computer/computer monitor",
      "Any size mattress",
      "Any furniture",
    ],
    img: "/price-minimum.webp",
  },
  {
    label: "Half truckload",
    points: [
      "Eight standard sized refrigerators",
      "Six full-sized three-seater sofas",
      "Great for garage cleanouts",
      "Any furniture",
    ],
    img: "/price-minimum-3.webp",
  },
  {
    label: "Full truckload",
    points: [
      "Great for big home moveouts",
      "Six full-sized three-seater sofas",
      "Great for garage cleanouts",
      "Any furniture",
    ],
    img: "/price-half-2.webp",
  },
];

export default function Pricing() {
  return (
    <>
      {/* 1) ABOUT SECTION */}
      <section className="bg-white pb-16 md:pb-20">
        <div className="section-inner grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Truck Image Area */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[520px]">
              <Image
                src="/ruck-hero.png"
                alt="Journey Forward truck"
                width={800}
                height={480}
                className="h-auto w-full object-contain"
                priority
              />
            </div>
          </div>

          {/* Text Area */}
          <div className="max-w-xl mx-auto lg:mx-0 lg:ml-auto space-y-6 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              Enjoy a better way
              <br />
              to <span className="text-[#22503B]">clear out clutter</span>
            </h2>

            <p className="text-base text-slate-600 leading-relaxed">
              We make your space shine! Professional and reliable Pick-up
              service company providing top-notch solutions for homes and
              businesses. Satisfaction guaranteed!
            </p>

            {/* Feature Grid: ここを grid-cols-2 に変更しました */}
            <div className="grid grid-cols-2 gap-4 text-sm font-medium text-slate-800">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-3 text-left"
                >
                  <CheckIcon />
                  <span className="leading-tight">{feature}</span>
                </div>
              ))}
            </div>

            {/* Button Area */}
            <div className="flex justify-center lg:justify-start pt-2">
              <Link href="/booking">
                <Button className="h-12 bg-[#2E6F56] px-8 text-base font-semibold text-white hover:bg-[#22503B]">
                  Book Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2) PRICING SECTION */}
      <section className="bg-[#22503B]/90 py-16 text-white">
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
                  <p className="inline-block rounded-full border border-[#2E6F56]/15 bg-[#2E6F56]/5 px-3 py-1 text-[11px] font-medium text-[#2E6F56]">
                    {tier.label}
                  </p>

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
                    <Button className="w-full bg-[#2E6F56] text-sm font-semibold text-white hover:bg-[#22503B] ">
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
