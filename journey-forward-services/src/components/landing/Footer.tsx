'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-linear-to-bl from-[#317255] via-[#295E46] to-[#204A37] text-white pt-16 pb-8">
      {' '}
      <div className="section-inner container mx-auto px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Left Column: Brand & Contact */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-16 w-64">
                <Image
                  src="/footer-logo.svg"
                  alt="Logo"
                  fill
                  // 画像が枠内で左寄せになるように object-left を追加すると収まりが良い場合があります
                  className="object-contain object-left brightness-0 invert"
                />
              </div>
            </Link>

            <div className="space-y-4 text-lg text-gray-100">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5" />
                <span>+1 603 4784 273 12</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5" />
                <span>journeyforwardservices@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Center Column: Navigation Links */}
          <div className="flex flex-col gap-4 text-lg font-medium md:w-fit md:mx-auto md:pt-2">
            <Link href="/about" className="hover:opacity-80 transition-opacity">
              About Us
            </Link>
            <Link
              href="/contact"
              className="hover:opacity-80 transition-opacity"
            >
              Contact
            </Link>
            <Link href="/faq" className="hover:opacity-80 transition-opacity">
              FAQs
            </Link>
          </div>

          {/* Right Column: CTA */}
          <div className="flex flex-col md:items-end md:pt-2">
            <Link
              href="/booking"
              className="text-lg font-medium underline underline-offset-4 hover:text-gray-200 transition-colors"
            >
              Get an Estimate
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-white/20 pt-8 text-center text-xs text-gray-300">
          Copyright 2025 • Journey Forward Services, All Rights Reserved
        </div>
      </div>
    </footer>
  );
}
