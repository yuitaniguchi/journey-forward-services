'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  items: FaqItem[];
};

export default function FaqAccordion({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`overflow-hidden  border bg-white transition-colors duration-300 ${
              isOpen ? 'border-[#367D5E]' : 'border-gray-200'
            }`}
          >
            <button
              onClick={() => toggleAccordion(index)}
              className="flex w-full items-center justify-start gap-4 p-5 text-left"
            >
              {/* Icon */}
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center  transition-colors ${
                  isOpen ? 'bg-[#367D5E] text-white' : 'bg-[#367D5E] text-white'
                }`}
              >
                {isOpen ? (
                  <Minus className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </div>

              <span className="text-base font-medium text-[#000000]">
                {item.question}
              </span>
            </button>

            {/* Answer Area */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="pl-13 pr-5 pb-5 text-sm leading-relaxed text-[#2F2F2F]">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
