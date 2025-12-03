'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Phone, Mail, Clock } from 'lucide-react';

const contactInfo = [
  {
    icon: Phone,
    title: 'Call Us',
    text: '+(03) 255 201 888',
  },
  {
    icon: Mail,
    title: 'Email Now',
    text: 'Hello@procleaning.com',
  },
  {
    icon: Clock,
    title: 'Hours',
    text: 'Mon–Friday 10:00AM – 7:00PM',
  },
];

type ContactSectionProps = {
  showPageHeading?: boolean;
};

export default function ContactSection({
  showPageHeading = false,
}: ContactSectionProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch('https://formspree.io/f/mnnevkyj', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        // optional: clear the form
        form.reset();
        // go to the success page we created
        router.push('/contact/success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    } finally {
      setStatus((prev) => (prev === 'submitting' ? 'idle' : prev));
    }
  }

  return (
    <section className="bg-white py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* Page heading */}
        {showPageHeading && (
          <div className="mb-12 text-center space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-400">
              Contact
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Let&apos;s talk with us
            </h1>
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid gap-16 lg:grid-cols-2">
          {/* LEFT: info cards */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-brand-dark mb-2">
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
                  className="flex items-center gap-4 rounded-2xl bg-gray-50 p-5 shadow-sm"
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

            <Button className="mt-2 inline-flex rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
              Get an Estimate
            </Button>
          </div>

          {/* RIGHT: form */}
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-brand-dark mb-2">
              Talk to us
            </h2>
            <p className="mb-4 text-sm text-gray-500 max-w-md">
              We prioritize responding to your inquiries promptly to ensure you
              receive the assistance you need in a timely manner.
            </p>

            {/* error message */}
            {status === 'error' && (
              <p className="mb-4 text-xs text-red-500">
                Something went wrong sending your message. Please try again or
                email us directly.
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1 text-sm">
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John"
                  required
                  className="rounded-lg border-gray-200 bg-white"
                />
              </div>

              <div className="space-y-1 text-sm">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@gmail.com"
                  required
                  className="rounded-lg border-gray-200 bg-white"
                />
              </div>

              <div className="space-y-1 text-sm">
                <Label htmlFor="message">
                  Message <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Message"
                  required
                  className="min-h-[120px] rounded-lg border-gray-200 bg-white"
                />
              </div>

              <Button
                type="submit"
                disabled={status === 'submitting'}
                className="mt-2 w-32 rounded-full bg-brand text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {status === 'submitting' ? 'Sending...' : 'Submit'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
