import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-brand-dark text-white pt-16 pb-8">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
        {/* Col 1: Brand & Contact */}
        <div className="space-y-4 md:col-span-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 bg-white/20 rounded-sm" />{' '}
            {/* Logo Placeholder */}
            <span>JOURNEY FORWARD SERVICES</span>
          </Link>

          <div className="space-y-3 pt-2 text-gray-300">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-brand-light" />
              <span>+1 603 4784 273 12</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-brand-light" />
              <span>journeyforwardservices@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Col 2: Navigation Links */}
        <div>
          <h3 className="font-bold mb-4 uppercase tracking-wider text-gray-400">
            Menu
          </h3>
          <ul className="space-y-3 text-gray-300">
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Contact
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                FAQs
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: CTA */}
        <div className="md:text-right">
          <Link
            href="#"
            className="text-brand-light font-medium underline hover:text-white transition-colors"
          >
            Get an Estimate
          </Link>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container mt-12 pt-8 border-t border-white/10 text-center text-xs text-gray-400">
        Copyright 2025 - Journey Forward Services, All Rights Reserved
      </div>
    </footer>
  );
}
