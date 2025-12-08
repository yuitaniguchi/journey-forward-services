"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  initialSubtotal?: number;
  initialNote?: string; // ★ 追加
  onClose: () => void;
  onSave: (payload: {
    subtotal: number;
    sendEmail: boolean;
    note: string; // ★ 追加
  }) => Promise<void> | void;
};

export default function QuotationModal({
  open,
  initialSubtotal = 0,
  initialNote,
  onClose,
  onSave,
}: Props) {
  const [subtotalStr, setSubtotalStr] = useState("");
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState(initialNote ?? ""); // ★ 追加

  useEffect(() => {
    if (open) {
      setSubtotalStr(initialSubtotal ? initialSubtotal.toString() : "");
      setNote(initialNote ?? ""); // ★ ここを追加
    }
  }, [open, initialSubtotal, initialNote]);

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
      await onSave({ subtotal, sendEmail, note }); // ★ note を渡す
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
        <div className="mb-6 flex items-start justify-between">
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
          <label className="mb-2 block text-sm font-semibold text-slate-900">
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
        <div className="mb-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Tax (12%):</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* ★ Note (optional) */}
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note for the customer"
            rows={4}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <p className="mb-4 text-sm font-semibold text-slate-900">
          Send updated quotation email to the customer?
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 md:flex-row">
            <button
              type="button"
              disabled={sending}
              onClick={() => handleSave(false)}
              className="flex-1 rounded-xl border border-slate-900 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white disabled:opacity-60"
            >
              Save only
            </button>
            <button
              type="button"
              disabled={sending}
              onClick={() => handleSave(true)}
              className="flex-1 rounded-xl bg-emerald-900 py-3 text-sm font-semibold text-white transition hover:bg-emerald-950 disabled:opacity-60"
            >
              Save &amp; Send
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
