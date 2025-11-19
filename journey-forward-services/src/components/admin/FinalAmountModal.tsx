"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  initialAmount?: string;
  initialBreakdown?: string;
  onClose: () => void;
  onSend: (payload: {
    amount: string;
    breakdown: string;
  }) => Promise<void> | void;
};

export default function FinalAmountModal({
  open,
  initialAmount = "",
  initialBreakdown = "",
  onClose,
  onSend,
}: Props) {
  const [amount, setAmount] = useState(initialAmount);
  const [breakdown, setBreakdown] = useState(initialBreakdown);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(initialAmount);
      setBreakdown(initialBreakdown);
    }
  }, [open, initialAmount, initialBreakdown]);

  if (!open) return null;

  async function handleSend() {
    if (!amount.trim()) {
      alert("Please enter final amount");
      return;
    }

    try {
      setSending(true);
      await onSend({ amount, breakdown });
      onClose();
    } catch {
      alert("Failed to send final amount");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white px-8 py-8 shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-3xl font-bold text-slate-900">
            Send Final Amount
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-slate-500 hover:text-slate-900"
          >
            ×
          </button>
        </div>

        {/* Final Amount */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Final Amount
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Breakdown */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Breakdown
          </label>
          <textarea
            value={breakdown}
            onChange={(e) => setBreakdown(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Service 650, Tax 30..."
          />
        </div>

        <p className="mb-6 text-sm text-slate-700">
          Customer will receive a payment link (status → Invoiced).
        </p>

        <div className="flex flex-col md:flex-row gap-3">
          <button
            type="button"
            disabled={sending}
            onClick={handleSend}
            className="flex-1 rounded-xl bg-emerald-900 py-3 text-sm font-semibold text-white hover:bg-emerald-950 transition disabled:opacity-60"
          >
            Send Final Amount
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
