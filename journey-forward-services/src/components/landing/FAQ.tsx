"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus } from "lucide-react";

const faqItems = [
  {
    question: "What types of items do you remove?",
    answer:
      "We take almost everything, including furniture, appliances, electronics, and yard waste. We do not take hazardous materials.",
  },
  {
    question: "Do you accept items for donation?",
    answer:
      "Yes! If items are in good condition, we prioritize donating them to our local charity partners.",
  },
  {
    question: "How do I book a junk removal pick-up?",
    answer:
      "You can book by clicking 'Get an Estimate', filling out the form, and we will text or email you to confirm your booking.",
  },
  {
    question: "How much does it cost?",
    answer:
      "We price based on the volume your items take up in our truck. Our 'Minimum truckload' is our starting price point.",
  },
];

export default function FAQ() {
  return (
    <section
      id="faqs"
      className="bg-white py-16 md:py-24 relative overflow-hidden"
    >
      <div className="mx-auto w-full max-w-6xl px-4 relative z-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-20 items-start">
          {/* Left Side (Desktop) / Header (Mobile) */}
          <div className="relative">
            {/* Desktop Watermark */}
            <div className="hidden lg:block absolute -top-16 -left-6 -z-10 select-none pointer-events-none">
              <span className="text-[140px] font-bold text-[#E6F4EA] leading-none opacity-60">
                Q&A
              </span>
            </div>

            {/* Mobile Title */}
            <div className="text-center lg:hidden mb-8">
              <h2 className="text-4xl font-bold text-slate-900 mb-3">FAQ</h2>
              <p className="text-sm text-gray-500">
                You have questions? we&apos;ve got you.
              </p>
            </div>

            {/* Desktop Content */}
            <div className="hidden lg:block space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-400">
                Q &amp; A
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-[1.15]">
                Frequently Asked
                <br />
                questions
              </h2>
              <p className="text-base text-gray-500 max-w-sm pt-2">
                You have questions? we&apos;ve got you.
              </p>

              <div className="pt-4">
                <Link href="/faq">
                  <Button
                    variant="outline"
                    className="border-brand text-brand hover:bg-brand/5 px-8 h-10"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side: Accordion */}
          <div>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.question}
                  value={item.question}
                  className="border border-slate-100 bg-white rounded-xl shadow-sm px-2"
                >
                  <AccordionTrigger className="hover:no-underline py-4 px-2 [&>svg]:hidden">
                    <div className="flex items-center gap-4 text-left">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F1BB15] text-white">
                        <Plus strokeWidth={3} className="h-3 w-3" />
                      </div>
                      <span className="text-base font-semibold text-slate-900">
                        {item.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-12 pb-4 text-sm text-gray-600 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Mobile Button */}
            <div className="mt-8 flex justify-center lg:hidden">
              <Link href="/faq">
                <Button
                  variant="outline"
                  className="border-brand text-brand hover:bg-brand/5 px-8 h-10"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
