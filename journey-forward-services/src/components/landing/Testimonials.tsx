"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Erick Reynolds",
    role: "",
    img: "/testimonial-1.webp",
  },
  {
    name: "Erick Reynolds",
    role: "",
    img: "/testimonial-2.webp",
  },
  {
    name: "Erick Reynolds",
    role: "",
    img: "/testimonial-3.webp",
  },
];

function StarRating() {
  return (
    <div className="flex gap-1 mb-3">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-[#F9B301] text-[#F9B301]" />
      ))}
    </div>
  );
}

export default function Features() {
  return (
    <>
      <section className="section bg-white">
        <div className="section-inner space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-center md:justify-between mb-8 gap-6 text-center md:text-left">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-black">
                <span className="text-[#22503B] mb-1">People Love</span>
                <br />
                Working With Us
              </h2>
            </div>

            <div className="max-w-sm mx-auto md:ml-auto md:mr-0 text-black">
              <h3 className="font-bold text-md md:text-lg mb-2">
                Testimonials
              </h3>
              <p className="text-sm md:text-base text-[#666666]">
                We’ve had the pleasure of helping many satisfied customers, and
                their positive feedback keeps us going.
              </p>
            </div>
          </div>

          <hr />

          {/* Testimonials Grid */}
          <div className="flex flex-wrap justify-center gap-6">
            {testimonials.map((t, idx) => (
              <Card
                key={idx}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] overflow-hidden border border-slate-200 shadow-sm rounded-lg"
              >
                <div className="relative aspect-square w-full bg-slate-200">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <CardContent className="p-6">
                  <h4 className="text-xl font-bold text-slate-900 mb-1">
                    {t.name}
                  </h4>
                  <StarRating />
                  <p className="text-sm md:text-lg text-slate-500 leading-relaxed">
                    He is an expert cleaning staff member who provides thorough
                    cleaning with precision.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
