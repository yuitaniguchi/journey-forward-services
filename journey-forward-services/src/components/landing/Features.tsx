'use client';

import { Card, CardContent } from '@/components/ui/card';

const serviceCards = [
  {
    title: 'Send a Request for Estimate',
    text: 'Select items and fill in your info to get a detailed estimate.',
    img: '/images/service-1.jpg',
  },
  {
    title: 'Review & Confirm a Pickup',
    text: 'After you get a detailed estimate by email or text, you can confirm your booking.',
    img: '/images/service-2.jpg',
  },
  {
    title: 'Pick up, Deliver or Donate',
    text: 'Your items are either delivered or donated.',
    img: '/images/service-3.jpg',
  },
];

const testimonials = [
  {
    name: 'Erick Reynolds',
    role: '',
    img: '/images/testimonial-1.jpg',
  },
  {
    name: 'Erick Reynolds',
    role: '',
    img: '/images/testimonial-2.jpg',
  },
  {
    name: 'Erick Reynolds',
    role: '',
    img: '/images/testimonial-3.jpg',
  },
];

export default function Features() {
  return (
    <>
      {/* “Need a hand?” + 3 cards */}
      <section className="section">
        <div className="section-inner space-y-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand">Need a hand?</p>
              <h2 className="text-2xl md:text-3xl font-semibold">
                We’ve got you covered.
              </h2>
            </div>
            <div className="max-w-md text-sm text-slate-600">
              <h3 className="mb-1 font-semibold">How it works</h3>
              <p>
                While we can customize your plan to suit your needs, most
                clients schedule pick-up services.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {serviceCards.map((card) => (
              <Card
                key={card.title}
                className="overflow-hidden border-none shadow-card"
              >
                <div className="h-40 w-full bg-slate-200">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="space-y-2 p-5">
                  <h3 className="text-sm font-semibold">{card.title}</h3>
                  <p className="text-xs text-slate-600">{card.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-neutralBg">
        <div className="section-inner space-y-8">
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

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, idx) => (
              <Card
                key={idx}
                className="overflow-hidden border-none shadow-card"
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
