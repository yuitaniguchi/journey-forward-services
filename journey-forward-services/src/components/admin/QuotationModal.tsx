"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  initialSubtotal?: number;
  onClose: () => void;
  onSave: (payload: {
    subtotal: number;
    sendEmail: boolean;
  }) => Promise<void> | void;
};

export default function QuotationModal({
  open,
  initialSubtotal = 0,
  onClose,
  onSave,
}: Props) {
  const [subtotalStr, setSubtotalStr] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setSubtotalStr(initialSubtotal ? initialSubtotal.toString() : "");
    }
  }, [open, initialSubtotal]);

  const subtotal = parseFloat(subtotalStr) || 0;
  const tax = subtotal * 0.12; // BC Tax 12%
  const total = subtotal + tax;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(val);

  if (!open) return null;

  async function handleSave(sendEmail: boolean) {
    if (!subtotal || subtotal < 0) {
      alert("Please enter a valid subtotal");
      return;
    }

    try {
      setSending(true);
      await onSave({ subtotal, sendEmail });
      onClose();
    } catch {
      alert("Failed to save quotation");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white px-8 py-8 shadow-xl">
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

        {/* Subtotal Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Subtotal ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={subtotalStr}
            onChange={(e) => setSubtotalStr(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Calculation Preview */}
        <div className="mb-8 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Tax (12%):</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900 text-base">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <p className="mb-4 text-sm font-semibold text-slate-900">
          Send updated quotation email to the customer?
        </p>

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
