'use client';

import Image from 'next/image';

// 👉 Make sure these 3 images exist in /public/images
const steps = [
  {
    title: 'Send a Request for Estimate',
    description:
      'Select items and fill in your info to get a detailed estimate.',
    image: '/service-1.webp',
  },
  {
    title: 'Review & Confirm a Pickup',
    description:
      'After you get a detailed estimate by email or text, you can confirm your booking.',
    image: '/service-2.webp',
  },
  {
    title: 'Pick up, Deliver or Donate',
    description: 'Your items are either delivered or donated.',
    image: '/service-3.webp',
  },
];

export function HowItWorks() {
  return (
    <section className="pt-16 md:pt-20 pb-16">
      <div className="section-inner">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <p className="text-sm font-semibold text-brand mb-1">
              Need a hand?
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold text-brand-dark">
              We&apos;ve got you covered.
            </h2>
          </div>
          <div className="max-w-sm md:text-right md:ml-auto">
            <h3 className="font-bold text-lg text-brand-dark mb-2">
              How it works
            </h3>
            <p className="text-sm text-gray-500">
              While we can customize your plan to suit your needs, most clients
              schedule pick-up services through these simple steps.
            </p>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.title}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden group"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-5 md:p-6 space-y-2">
                <h3 className="font-semibold text-base text-brand-dark">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
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
