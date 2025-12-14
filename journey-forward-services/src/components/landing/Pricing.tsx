"use client";

import Link from "next/link";
import Image from "next/image";
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
  );
}
