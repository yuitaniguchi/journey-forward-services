"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const features = [
  {
    title: "Creates opportunity",
    description:
      "Every job creates opportunity for someone to rebuild their life.",
    details:
      "We believe in second chances. By providing stable employment and mentorship, we help individuals overcome barriers and build a sustainable career path.",
  },
  {
    title: "Reuse and recycle",
    description: "We reuse and recycle to help both people and the planet.",
    details:
      "We carefully sort all collected items, donating usable goods to local charities and ensuring that materials are properly recycled to minimize waste.",
  },
  {
    title: "We keep prices low",
    description: "Because purpose matters more than profit.",
    details:
      "By optimizing our logistics and focusing on community impact rather than maximizing margins, we offer professional services at fair rates.",
  },
];

export default function WhyDifferent() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFeature = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* Heading Section */}
        <div className="mb-12 md:mb-16 text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Why We&apos;re Different
          </h2>
          <p className="mx-auto max-w-xl text-sm md:text-base text-gray-500 leading-relaxed">
            Your support doesn&apos;t just clean a space—it changes a life.{" "}
            <br className="hidden md:block" />
            Help someone journey forward.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-3 items-start">
          {features.map((feature, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="flex flex-col rounded-lg border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Plus Button */}
                <button
                  onClick={() => toggleFeature(index)}
                  className={`mb-6 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-white transition-all duration-300 focus:outline-none 
                    ${isOpen ? "bg-slate-900 rotate-45" : "bg-gray-500 hover:bg-gray-600"}`}
                  aria-label={isOpen ? "Close details" : "Show details"}
                >
                  <Plus size={24} />
                </button>

                <h3 className="mb-3 text-xl font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {feature.description}
                </p>

                {/* Expanded Details (Accordion) */}
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] mt-4 pt-4 border-t border-gray-100"
                      : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm leading-relaxed text-gray-600">
                      {feature.details}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
