"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 shadow-sm bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="section-inner container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo Area */}
        <Link
          href="/"
          className="relative flex h-12 w-48 md:h-16 md:w-72 items-center"
        >
          <Image
            src="/nav-logo.png"
            alt="Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </Link>

        {/* Desktop Nav links */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
          <Link href="/" className="transition-colors hover:text-brand">
            Home
          </Link>
          <Link href="/about" className="transition-colors hover:text-brand">
            About us
          </Link>
          <Link href="/contact" className="transition-colors hover:text-brand">
            Contact
          </Link>
          <Link href="/faq" className="transition-colors hover:text-brand">
            FAQs
          </Link>
        </nav>

        {/* Desktop CTA Button */}
        <div className="hidden md:block">
          <Link href="/booking">
            <Button className="rounded-md bg-brand px-6 py-5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark">
              Get an Estimate
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="block md:hidden text-brand focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white px-6 py-4 shadow-lg">
          <nav className="flex flex-col space-y-4 text-sm font-medium text-slate-700">
            <Link
              href="/"
              className="block transition-colors hover:text-brand"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block transition-colors hover:text-brand"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About us
            </Link>
            <Link
              href="/contact"
              className="block transition-colors hover:text-brand"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/faq"
              className="block transition-colors hover:text-brand"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              FAQs
            </Link>

            <div className="pt-2">
              <Link href="/booking" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full rounded-md bg-brand py-5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark">
                  Get an Estimate
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
