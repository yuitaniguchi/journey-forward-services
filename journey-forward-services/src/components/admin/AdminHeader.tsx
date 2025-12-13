"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminHeader() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoginPage && isMobileMenuOpen) {
    setIsMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-20 shadow-sm bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
      <div className="section-inner container mx-auto flex h-20 items-center justify-between px-6">
        <Link href="/admin" className="relative flex items-center gap-2">
          <div className="relative h-12 w-48 md:h-16 md:w-72">
            <Image
              src="/nav-logo.png"
              alt="Admin Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
          <span className="mb-2 rounded bg-brand px-2 py-1 text-xs md:text-sm font-bold text-white shadow-sm">
            ADMIN
          </span>
        </Link>

        {!isLoginPage && (
          <>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center ml-auto gap-8">
              <nav className="flex items-center gap-8 text-md font-medium text-slate-700">
                <Link
                  href="/admin"
                  className="transition-colors hover:text-brand"
                >
                  Requests
                </Link>
                <Link
                  href="/admin/users"
                  className="transition-colors hover:text-brand"
                >
                  Users
                </Link>
                <Link
                  href="/admin/discounts"
                  className="transition-colors hover:text-brand"
                >
                  Discounts
                </Link>
                <Link
                  href="/admin/profile"
                  className="transition-colors hover:text-brand"
                >
                  Change Password
                </Link>
                <LogoutButton isMobile={false} />
              </nav>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="block md:hidden text-brand focus:outline-none ml-auto"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-8 h-8 text-slate-700"
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
                  className="w-8 h-8 text-slate-700"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {!isLoginPage && isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white px-6 py-4 shadow-lg">
          <nav className="flex flex-col space-y-4 text-sm font-medium text-slate-700">
            <Link
              href="/admin"
              className="block transition-colors hover:text-brand"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Requests
            </Link>
            <Link
              href="/admin/users"
              className="block transition-colors hover:text-brand"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Users
            </Link>
            <Link
              href="/admin/discounts"
              className="block transition-colors hover:text-brand"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Discounts
            </Link>
            <Link
              href="/admin/profile"
              className="block transition-colors hover:text-brand"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Change Password
            </Link>
            <div onClick={() => setIsMobileMenuOpen(false)}>
              <LogoutButton isMobile={true} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
