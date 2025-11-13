import { Button } from '@/components/ui/button';
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
            <Button
              variant="outline"
              className="mt-4 rounded-full border-brand-dark px-6 py-2 text-sm font-medium text-brand-dark hover:bg-brand/5"
            >
              Learn More
            </Button>
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
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-yellow text-xs font-bold text-brand-dark">
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
    </section>
  );
}
