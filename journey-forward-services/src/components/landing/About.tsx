"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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

export default function About() {
  return (
    <section className="bg-white">
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
            We make your space shine! Professional and reliable Pick-up service
            company providing top-notch solutions for homes and businesses.
            Satisfaction guaranteed!
          </p>

          {/* Feature Grid */}
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
  );
}
