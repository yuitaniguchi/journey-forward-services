"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Phone, Mail, Clock } from 'lucide-react';


const faqs = [
  {
    question: "How far in advance should I book?",
    answer:
      "We recommend booking at least one week in advance to secure your preferred date.",
  },
  {
    question: "Do you offer same-day service?",
    answer:
      "Yes, depending on availability. Please contact our support team for urgent requests.",
  },
  {
    question: "Can I change my booking after submitting?",
    answer:
      "Absolutely. You can modify your booking up to 24 hours before the scheduled service.",
  },
  {
    question: "What areas do you serve?",
    answer:
      "We currently serve Vancouver, Burnaby, Richmond, Surrey, and North Vancouver.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "Currently, we only accept credit card payments.",
  },
  {
    question: "What services does Journey Forward Services (JFS) offer?",
    answer:
      "JFS provides pick-up and delivery services, including junk removal, as well as regional moving and relocation services for refugee claimant families. We aim to expand into full home and commercial moving, cleaning, and property maintenance. We prioritize reusing and refurbishing items whenever possible.",
  },
  {
    question: "How do I get a quote for your services?",
    answer:
      "Quotes can be requested through our website form. We require information about the items (size, weight, quantity), as well as pickup location details such as floor level, elevator access, and parking availability. Quotes are sent by email and may sometimes require further dialogue to ensure accuracy.",
  },
  {
    question: "What types of items do you pick up?",
    answer:
      "We pick up items ranging from single pieces of furniture to entire house clearances, including furniture, appliances, clothing, dishes, and general junk. We aim to reuse and refurbish useful items instead of sending them to a landfill.",
  },
  {
    question: "How is JFS different from other pick-up and moving services?",
    answer:
      "JFS is a mission-driven company providing dignified employment to vulnerable individuals, including low-income persons, asylum-seekers, addiction-recovery graduates, and refugees. By choosing JFS, you support a faith-based, social impact model focused on community benefit and waste reduction.",
  },
  {
    question: "Do you offer discounts?",
    answer:
      "Yes. Individuals referred by partner organizations such as Union Gospel Mission (UGM) and Journey Home Community (JHC) may receive discount codes (e.g., GHC 0057) that offer significant savings (e.g., 15–30%).",
  },
  {
    question: "What is your cancellation policy?",
    answer:
      "You may cancel your service at least 24 hours before the scheduled pickup without a fee. Cancellations within 24 hours may incur a fee if staff and a truck have already been dispatched, as this covers labor and gas. Payment is usually charged after the pickup is completed.",
  },
  {
    question: "What happens to the items you pick up?",
    answer:
      "Useful items are sorted for reuse, refurbishment, or resale. We partner with thrift stores and organizations such as UGM, RCA, and Home Start to distribute items to families in need. Items that cannot be reused are responsibly disposed of at the dump.",
  },
];

    const contactInfo = [
      {
        icon: Phone,
        title: "Call Us",
        text: "+(03) 255 201 888",
      },
      {
        icon: Mail,
        title: "Email Now",
        text: "Hello@procleaning.com",
      },
      {
        icon: Clock,
        title: "Hours",
        text: "Mon-Friday 10:00AM - 7:00PM",
      },
    ];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-[#22503B]">
          Frequently Asked Questions
        </h1>
        <p className="text-slate-600 mt-2">
          Common questions our customers often ask.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className={`rounded-lg bg-white shadow-sm border ${
                isOpen ? "border-[#367D5E]" : "border-slate-200"
              }`}
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex justify-between items-center p-4 text-left"
              >
                <span className="font-medium text-slate-900">
                  {faq.question}
                </span>

                {isOpen ? (
                  <Minus className="h-5 w-5 text-[#367D5E]" />
                ) : (
                  <Plus className="h-5 w-5 text-[#367D5E]" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 text-slate-700 text-sm">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>


        {/* Contact Section */}
        <div className="mt-24 grid gap-16 border-t pt-16 lg:grid-cols-2">
          {/* Left Side: Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-brand-dark mb-2">
                Get in touch
              </h2>
              <p className="text-sm text-gray-600">
                Want to book a pick up? Please get an estimate first.
              </p>
            </div>

            <div className="space-y-4">
              {contactInfo.map((item) => (
                <div
                  key={item.title}
                  className="card-elevated flex items-center gap-4 rounded-2xl bg-gray-50 p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-brand-dark">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button className="mt-4 inline-flex rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
              Get an Estimate
            </Button>
          </div>

          {/* Right Side: Form */}
          <div>
            <h2 className="text-3xl font-bold text-brand-dark mb-2">
              Talk to us
            </h2>
            <p className="mb-8 text-sm text-gray-500">
              We prioritize responding to your inquiries promptly to ensure you
              receive the assistance you need in a timely manner.
            </p>

            <form className="space-y-4">
              <div className="space-y-1 text-sm">
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Name"
                  className="rounded-lg border-gray-200 bg-white"
                />
              </div>
              <div className="space-y-1 text-sm">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  className="rounded-lg border-gray-200 bg-white"
                />
              </div>
              <div className="space-y-1 text-sm">
                <Label htmlFor="message">
                  Message <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="message"
                  placeholder="Message"
                  className="min-h-[120px] rounded-lg border-gray-200 bg-white"
                />
              </div>
              <Button
                type="submit"
                className="mt-2 w-32 rounded-full bg-brand text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Submit
              </Button>
            </form>
          </div>
        </div>
    </div>
  );
}
