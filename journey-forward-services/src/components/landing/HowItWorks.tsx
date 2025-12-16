"use client";

import Image from "next/image";

const steps = [
  {
    title: "Send a Request for Estimate",
    description:
      "Select items and fill in your info to get a detailed estimate.",
    image: "/home/service-1.webp",
  },
  {
    title: "Review & Confirm a Pickup",
    description:
      "After you get a detailed estimate by email or text, you can confirm your booking.",
    image: "/home/service-2.webp",
  },
  {
    title: "Pick up, Deliver or Donate",
    description: "Your items are either delivered or donated.",
    image: "/home/service-3.webp",
  },
];

export function HowItWorks() {
  return (
    <section className="pt-16 md:pt-20 bg-white">
      <div className="section-inner">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-center md:justify-between mb-8 gap-6 text-center md:text-left">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-black">
              <span className="text-[#22503B] mb-1">Need a hand?</span>
              <br />
              We&apos;ve got you covered.
            </h2>
          </div>

          <div className="max-w-sm mx-auto md:ml-auto md:mr-0 text-black">
            <h3 className="font-bold text-md md:text-lg mb-2">How it works</h3>
            <p className="text-sm md:text-base text-[#666666]">
              While we can customize your plan to suit your needs, most clients
              schedule pick-up services through these simple steps.
            </p>
          </div>
        </div>

        <hr />

        {/* Steps Grid */}
        <div className="flex flex-wrap justify-center gap-8 mt-8">
          {steps.map((step) => (
            <div
              key={step.title}
              className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1.34rem)]"
            >
              <div className="relative aspect-4/3 overflow-hidden">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="py-5 md:py-6 space-y-2">
                <h3 className="font-semibold text-lg text-[#000000] text-center md:text-left">
                  {step.title}
                </h3>
                <p className="text-md text-[#2F2F2F] leading-relaxed text-center md:text-left">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
