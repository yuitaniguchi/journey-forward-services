"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  initialTotal?: string;
  onClose: () => void;
  onSave: (payload: {
    estimatedPrice: string;
    note: string;
    sendEmail: boolean;
  }) => Promise<void> | void;
};

export default function QuotationModal({
  open,
  initialTotal = "",
  onClose,
  onSave,
}: Props) {
  const [estimatedPrice, setEstimatedPrice] = useState(initialTotal);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setEstimatedPrice(initialTotal);
      setNote("");
    }
  }, [open, initialTotal]);

  if (!open) return null;

  async function handleSave(sendEmail: boolean) {
    if (!estimatedPrice.trim()) {
      alert("Please enter estimated price");
      return;
    }

    try {
      setSending(true);
      await onSave({ estimatedPrice, note, sendEmail });
      onClose();
    } catch {
      alert("Failed to save quotation");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white px-8 py-8 shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-3xl font-bold text-slate-900">Edit Quotation</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-slate-500 hover:text-slate-900"
          >
            ×
          </button>
        </div>

        {/* Estimated Price */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Estimated Price
          </label>
          <input
            type="text"
            value={estimatedPrice}
            onChange={(e) => setEstimatedPrice(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Note */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Add a note for the customer"
          />
        </div>

        {/* Send email label */}
        <p className="mb-4 text-sm font-semibold text-slate-900">
          Send updated quotation email to the customer
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3">
            <button
              type="button"
              disabled={sending}
              onClick={() => handleSave(false)}
              className="flex-1 rounded-xl border border-slate-900 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-900 hover:text-white transition disabled:opacity-60"
            >
              Save only
            </button>
            <button
              type="button"
              disabled={sending}
              onClick={() => handleSave(true)}
              className="flex-1 rounded-xl bg-emerald-900 py-3 text-sm font-semibold text-white hover:bg-emerald-950 transition disabled:opacity-60"
            >
              Save &amp; Send
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
