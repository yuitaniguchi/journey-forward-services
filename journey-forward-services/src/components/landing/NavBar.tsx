'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NavBar() {
  return (
    <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
      <div className="section-inner flex h-16 items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-wide">
            JOURNEY FORWARD SERVICES
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
          <Link href="#home" className="hover:text-brand">
            Home
          </Link>
          <Link href="#about" className="hover:text-brand">
            About us
          </Link>
          <Link href="#contact" className="hover:text-brand">
            Contact
          </Link>
          <Link href="#faqs" className="hover:text-brand">
            FAQs
          </Link>
        </nav>

        {/* CTA */}
        <Button className="hidden rounded-full bg-brand text-white px-5 py-2 text-sm font-medium shadow-sm hover:bg-brand-dark md:inline-flex">
          Get an Estimate
        </Button>
      </div>
    </header>
  );
}
