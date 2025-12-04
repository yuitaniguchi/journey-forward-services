import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

import NavBar from '@/components/landing/NavBar';
import Footer from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';

export default function ContactSuccessPage() {
  return (
    <main className="flex min-h-screen flex-col bg-neutralBg antialiased">
      {/* Centered content */}
      <section className="flex-1 bg-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-10 w-10 text-brand" />
          </div>

          <h1 className="mb-3 text-2xl md:text-3xl font-semibold text-slate-900">
            Thank you for getting in touch!
          </h1>

          <p className="mb-10 max-w-xl text-sm md:text-[13px] text-slate-500">
            You&apos;ll receive a confirmation email shortly. One of our team
            members will follow up within 24 hours.
          </p>

          <Link href="/" passHref>
            <Button className="rounded-full bg-brand px-8 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
              Go to Main Page
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
