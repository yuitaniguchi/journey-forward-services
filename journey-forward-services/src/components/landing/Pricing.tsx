'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

const tiers = [
  {
    label: 'Minimum truckload',
    points: [
      'Small appliances',
      'Computer/computer monitor',
      'Any size mattress',
      'Any furniture',
    ],
    img: '/images/price-minimum.png',
  },
  {
    label: 'Half truckload',
    points: [
      'Eight standard sized refrigerators',
      'Six full-sized three-seater sofas',
      'Great for garage cleanouts',
      'Any furniture',
    ],
    img: '/images/price-half-1.png',
  },
  {
    label: 'Half truckload',
    points: [
      'Great for big home moveouts',
      'Six full-sized three-seater sofas',
      'Great for garage cleanouts',
      'Any furniture',
    ],
    img: '/images/price-half-2.png',
  },
];

export default function Pricing() {
  return (
    <section className="section bg-brand-dark/90 text-white">
      <div className="section-inner space-y-10">
        <div className="grid gap-8 md:grid-cols-[1.1fr,1.1fr] md:items-center">
          <div className="relative h-56 md:h-72 lg:h-80">
            <img
              src="/images/truck-hero.png"
              alt="Truck"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Enjoy a better way
              <br />
              to <span className="text-accent-yellow">clear out clutter</span>
            </h2>
            <p className="text-sm text-brand-light/90">
              We make your space shine! Professional and reliable pick-up
              service company providing top-notch solutions for homes and
              businesses. Satisfaction guaranteed.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-brand-light">
              <div>• No hidden fee</div>
              <div>• Expert agent</div>
              <div>• Partner perks</div>
              <div>• 24/7 Booking</div>
              <div>• Sustainable approach</div>
              <div>• Affordable prices</div>
            </div>
            <Button className="mt-3 rounded-full bg-accent-yellow px-6 py-2 text-sm font-semibold text-brand-dark hover:bg-yellow-400">
              Book Now
            </Button>
          </div>
        </div>

        <h3 className="mt-6 text-center text-xl font-semibold">
          We price based on volume
        </h3>

        <div className="mt-4 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.label}
              className="card-elevated border-none bg-white text-slate-900"
            >
              <CardContent className="space-y-3 p-6">
                <p className="inline-block rounded-full border border-brand/15 bg-brand-light/40 px-3 py-1 text-[11px] font-medium text-brand">
                  {tier.label}
                </p>
                <div className="h-24 w-full bg-slate-100">
                  <img
                    src={tier.img}
                    alt={tier.label}
                    className="h-full w-full object-contain"
                  />
                </div>
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                  {tier.points.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button className="w-full rounded-full bg-brand text-sm font-semibold text-white hover:bg-brand-dark">
                  Get an Estimate
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
