"use client";

import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  requestNumber: string;
};

export default function StepSuccess({ requestNumber }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-[#367D5E] to-[#53C090] shadow-md">
        <Check className="h-8 w-8 text-white stroke-[3]" />
      </div>

      <h2 className="mb-3 text-2xl font-bold text-[#22503B]">
        Your Estimate is coming!
      </h2>

      <p className="mb-6 text-lg font-bold text-[#22503B]">
        Request Number: <span className="text-[#22503B]">{requestNumber}</span>
      </p>

      <p className="mb-4 text-xs font-medium text-slate-500 uppercase tracking-wide">
        Thanks for submitting the form!
      </p>

      <p className="mb-10 max-w-lg text-sm leading-relaxed text-slate-600">
        Our team will review your info and send you a detailed quote based on
        your items, location, and any special requests. You&apos;ll get an email
        with the estimate soon. If it looks good to you, just confirm the
        booking and pay through a secure link. No charges until you confirm.
      </p>

      <Button
        onClick={() => (window.location.href = "/")}
        className="min-w-[180px] rounded-md bg-brand px-6 py-2 text-white hover:bg-[#2e563d] transition-all shadow-sm"
      >
        Go to Main Page
      </Button>
    </div>
  );
}
