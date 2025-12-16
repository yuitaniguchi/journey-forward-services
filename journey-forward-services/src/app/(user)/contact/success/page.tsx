import Link from "next/link";
import { Check } from "lucide-react";

import Footer from "@/components/landing/Footer";

export default function ContactSuccessPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white antialiased">
      {/* Centered content */}
      <section className="flex-1 flex flex-col items-center justify-center py-16">
        <div className="mx-auto flex max-w-lg flex-col items-center px-4 text-center animate-in fade-in zoom-in-95 duration-500">
          {/* Icon with Gradient Background */}
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-[#367D5E] to-[#53C090] shadow-md">
            <Check className="h-8 w-8 text-white stroke-[3]" />
          </div>

          {/* Title */}
          <h1 className="mb-3 text-2xl font-bold text-[#22503B]">
            Thank you for getting in touch!
          </h1>

          {/* Subtitle / Status Label  */}
          <p className="mb-4 text-xs font-medium text-slate-500 uppercase tracking-wide">
            Submission Received
          </p>

          {/* Description */}
          <p className="mb-10 text-sm leading-relaxed text-slate-600">
            You&apos;ll receive a confirmation email shortly. One of our team
            members will follow up within 24 hours.
          </p>

          {/* Button Style Link */}
          <Link
            href="/"
            className="min-w-[180px] inline-flex items-center justify-center rounded-md bg-[#367D5E] px-6 py-2 text-sm font-medium text-white hover:bg-[#2e563d] transition-all shadow-sm"
          >
            Go to Main Page
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
