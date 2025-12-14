"use client";

import { Card, CardContent } from "@/components/ui/card";

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

export default function Features() {
  return (
    <>
      {/* ✅ TESTIMONIALS SECTION ONLY — CLEAN & CORRECT */}
      <section className="section bg-neutralBg">
        <div className="section-inner space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand">People Love</p>
              <h2 className="text-2xl md:text-3xl font-semibold">
                Working With Us
              </h2>
            </div>
            <div className="max-w-md text-sm text-slate-600">
              <h3 className="mb-1 font-semibold">Testimonials</h3>
              <p>
                We’ve had the pleasure of helping many satisfied customers, and
                their positive feedback keeps us going.
              </p>
            </div>
          </div>

          {/* Testimonials Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, idx) => (
              <Card
                key={idx}
                className="overflow-hidden border-none shadow-card rounded-3xl"
              >
                <div className="h-40 w-full bg-slate-200">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <CardContent className="space-y-3 p-5">
                  <h4 className="text-sm font-semibold">{t.name}</h4>
                  <p className="text-xs text-slate-600">
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
