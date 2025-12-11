'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Phone, Mail, Clock } from 'lucide-react';

// Data for the components
const faqItems = [
  {
    question: 'What types of items do you remove?',
    answer:
      'We take almost everything, including furniture, appliances, electronics, and yard waste. We do not take hazardous materials.',
  },
  {
    question: 'Do you accept items for donation?',
    answer:
      'Yes! If items are in good condition, we prioritize donating them to our local charity partners.',
  },
  {
    question: 'How do I book a junk removal pick-up?',
    answer:
      "You can book by clicking 'Get an Estimate', filling out the form, and we will text or email you to confirm your booking.",
  },
  {
    question: 'How much does it cost?',
    answer:
      "We price based on the volume your items take up in our truck. Our 'Minimum truckload' is our starting price point.",
  },
];

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
    text: 'Mon-Friday 10:00AM - 7:00PM',
  },
];

export function FAQContact() {
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
        form.reset();
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
    <section id="faqs" className="bg-white py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* FAQ Section */}
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-400">
              Q &amp; A
            </p>
            <h2 className="text-3xl font-bold text-brand-dark leading-snug">
              Frequently Asked
              <br />
              questions
            </h2>
            <p className="text-sm text-gray-500 max-w-sm">
              You have questions? we&apos;ve got you.
            </p>
            <Link href="/faq">
              <Button
                variant="outline"
                className="mt-4 border-brand-dark px-6 py-2 text-sm font-medium text-brand-dark hover:bg-brand/5"
              >
                Learn More
              </Button>
            </Link>
          </div>

          <div>
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.question}
                  value={item.question}
                  className="border-none"
                >
                  <AccordionTrigger className="group card-elevated flex w-full items-center justify-between rounded-2xl px-5 py-3 text-left text-sm font-medium text-gray-800 shadow-sm hover:no-underline">
                    <span className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center  bg-brand-yellow text-xs font-bold text-brand-dark">
                        !
                      </span>
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-4 pt-2 text-sm text-gray-500">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
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
                  className="card-elevated flex items-center gap-4  bg-gray-50 p-4"
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

            {/* Get an Estimate – same shape as navbar button */}
            <Link href="/booking">
              <Button className="mt-4 rounded-md bg-brand px-6 py-5 text-md font-semibold text-white shadow-sm hover:bg-brand-dark">
                Get an Estimate
              </Button>
            </Link>
          </div>

          {/* Right Side: Form */}
          <div>
            <h2 className="text-3xl font-bold text-brand-dark mb-2">
              Talk to us
            </h2>
            <p className="mb-4 text-sm text-gray-500">
              We prioritize responding to your inquiries promptly to ensure you
              receive the assistance you need in a timely manner.
            </p>

            {status === 'error' && (
              <p className="mb-4 text-xs text-red-500">
                Something went wrong sending your message. Please try again or
                email us directly.
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1 text-sm">
                <Label htmlFor="home-name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="home-name"
                  name="name"
                  placeholder="Name"
                  required
                  className="rounded-lg border-gray-200 bg-white"
                />
              </div>
              <div className="space-y-1 text-sm">
                <Label htmlFor="home-email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="home-email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className=" border-gray-200 bg-white"
                />
              </div>
              <div className="space-y-1 text-sm">
                <Label htmlFor="home-message">
                  Message <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="home-message"
                  name="message"
                  placeholder="Message"
                  required
                  className="min-h-[120px]  border-gray-200 bg-white"
                />
              </div>
              <Button
                type="submit"
                disabled={status === 'submitting'}
                className="mt-2 w-32  bg-brand text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
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
