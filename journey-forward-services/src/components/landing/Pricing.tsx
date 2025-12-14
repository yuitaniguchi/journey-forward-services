"use client";

import Link from "next/link";
import Image from "next/image";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const tiers = [
  {
    label: "Minimum truckload",
    points: [
      "Small appliances",
      "Computer/computer monitor",
      "Any size mattress",
      "Any furniture",
    ],
    img: "/home/price-minimum.webp",
  },
  {
    label: "Half truckload",
    points: [
      "Eight standard sized refrigerators",
      "Six full-sized three-seater sofas",
      "Great for garage cleanouts",
      "Any furniture",
    ],
    img: "/home/price-minimum-3.webp",
  },
  {
    label: "Full truckload",
    points: [
      "Great for big home moveouts",
      "Six full-sized three-seater sofas",
      "Great for garage cleanouts",
      "Any furniture",
    ],
    img: "/home/price-half-2.webp",
  },
];

export default function Pricing() {
  return (
    <section className="relative py-16 md:py-24 text-white overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-[#367D5E] via-[#479670] to-[#7ABF9D] lg:hidden -z-20" />

      <div className="absolute inset-0 hidden lg:block bg-[#367D5E] -z-20" />

      <div className="absolute inset-0 hidden lg:block opacity-[0.15] -z-10 pointer-events-none">
        <Image
          src="/home/bg-price.jpg"
          alt="Background Pattern"
          fill
          className="object-cover"
        />
      </div>

      <div className="section-inner container mx-auto px-4 relative z-10 space-y-12">
        <h3 className="text-center text-3xl md:text-5xl font-bold tracking-tight">
          We price based on volume
        </h3>

        <div className="flex flex-wrap justify-center gap-6">
          {tiers.map((tier) => (
            <Card
              key={tier.label}
              className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.33%-1rem)] border-none bg-white text-slate-900 rounded-3xl shadow-xl overflow-hidden flex flex-col"
            >
              <CardContent className="space-y-6 p-8 grow">
                <div>
                  <span className="inline-block rounded-lg border border-brand bg-[#EFF7F4] px-4 py-1.5 text-md font-semibold text-brand">
                    {tier.label}
                  </span>
                </div>

                <div className="flex justify-center items-center h-40 w-full relative">
                  <Image
                    src={tier.img}
                    alt={tier.label}
                    fill
                    className="object-contain"
                    draggable="false"
                  />
                </div>

                <ul className="space-y-3 text-md lg:text-lg text-slate-600 font-medium">
                  {tier.points.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span className="text-slate-400">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="p-8 pt-0 mt-auto">
                <Link href="/booking" className="w-full">
                  <Button className="w-full h-12 bg-[#2E6F56] text-base font-semibold text-white hover:bg-[#22503B] rounded-lg flex items-center justify-center gap-2 transition-all">
                    Get an Estimate
                    <MoveRight className="w-5 h-5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
