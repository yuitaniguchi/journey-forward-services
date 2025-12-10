'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { validatePostalCode } from '@/lib/availability';

export default function Hero() {
  const router = useRouter();
  const [postalCode, setPostalCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalized = postalCode.trim().toUpperCase();
    const result = validatePostalCode(normalized);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setLoading(true);
    router.push(`/booking?postalCode=${encodeURIComponent(result.value)}`);
  };

  return (
    <section
      id="home"
      className="relative overflow-hidden pt-10 md:pt-16 pb-16"
    >
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero-van.webp"
          alt="Journey Forward crew"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/10" />
      </div>

      {/* Content */}
      <div className="section-inner relative z-10">
        <div className="max-w-[640px] space-y-6">
          {/* <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            JOURNEY FORWARD SERVICES
          </p> */}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
            <span className="text-brand">Quickly</span> book and
            <br />
            clear out unwanted items
          </h1>

          <p className="max-w-md text-sm md:text-base text-slate-600">
            Book your junk removal or delivery service in minutes.
          </p>

          {/* === POSTAL CARD – match Figma geometry === */}
          <form onSubmit={handleCheckAvailability} className="mt-6">
            <div
              className="flex items-center border border-slate-200 bg-white/95 shadow-md"
              style={{
                width: '600px', // total width
                height: '60px', // total height
                borderRadius: '8px',
                padding: '12px 12px 12px 32px', // top/right/bottom/left
              }}
            >
              {/* Left: icon + texts (403 x 37, gap 16) */}
              <div
                className="flex items-center"
                style={{ width: '403px', gap: '16px' }}
              >
                {/* Pin icon circle */}
                <div
                  className="flex items-center justify-center border border-slate-200 bg-white"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '16px',
                  }}
                >
                  <MapPin className="h-4 w-4 text-slate-500" />
                </div>

                {/* Text block */}
                <div
                  className="flex flex-col justify-center"
                  style={{ height: '37px' }}
                >
                  <label
                    htmlFor="postal-code"
                    className="text-m text-slate-900 leading-tight"
                  >
                    Postal code
                  </label>

                  <input
                    id="postal-code"
                    value={postalCode}
                    onChange={(e) => {
                      setPostalCode(e.target.value);
                      if (error) setError('');
                    }}
                    className="mt-1 w-full border-none bg-transparent p-0 text-sm text-slate-700 focus:outline-none focus:ring-0"
                  />

                  <span className="mt-0.5 text-xs text-slate-400 leading-none">
                    Check if your location is available
                  </span>
                </div>
              </div>

              {/* Divider: same height as text block */}
              <div
                className="bg-slate-200"
                style={{ width: '1px', height: '37px', marginInline: '24px' }}
              />

              {/* Button – same vertical rhythm */}
              <Button
                type="submit"
                disabled={loading}
                className="border border-brand bg-white text-brand hover:bg-brand/10"
                style={{
                  borderRadius: 'px',
                  height: '35px',
                  paddingInline: '24px',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {loading ? 'Checking…' : 'Check Availability'}
              </Button>
            </div>

            {error && (
              <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>
            )}
          </form>

          <p className="text-[11px] text-slate-400">
            *We currently serve the Greater Vancouver area only.
          </p>
        </div>
      </div>
    </section>
  );
}
