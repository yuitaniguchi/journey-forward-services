"use client";

import { useState } from "react";
import { applyDiscountCode, removeDiscountCode } from "@/app/actions/discount";
import { X, Tag } from "lucide-react";

export interface ClientQuotation {
  id: number;
  subtotal: number;
  tax: number;
  total: number;
  discountAmount: number | null;
  discountCodeId: number | null;
  discountCode: string | null;
  originalSubtotal: number;
  originalTax: number;
  originalTotal: number;
}

interface DiscountActionResult {
  success: boolean;
  message: string;
  quotation?: ClientQuotation;
}

interface DiscountFormProps {
  requestId: number;
  currentQuotation: ClientQuotation | null | undefined;
  onUpdateQuotation: (
    newQuotation: ClientQuotation | null,
    successMessage: string | null,
    appliedCode: string | null
  ) => void;
}

export default function DiscountForm({
  requestId,
  currentQuotation,
  onUpdateQuotation,
}: DiscountFormProps) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isDiscountApplied = currentQuotation && currentQuotation.discountCode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    if (isDiscountApplied) {
      setMessage(
        "A discount is already applied. Please remove it first to apply a new one."
      );
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const result: DiscountActionResult = await applyDiscountCode(
        requestId,
        code
      );

      if (result.success && result.quotation) {
        onUpdateQuotation(result.quotation, result.message, code);
        setCode("");
      } else {
        setMessage(result.message);
        setIsError(true);
      }
    } catch (error) {
      setMessage("An unexpected error occurred during discount application.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDiscount = async () => {
    if (!isDiscountApplied) return;

    setIsLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const result: DiscountActionResult = await removeDiscountCode(requestId);

      if (result.success && result.quotation) {
        onUpdateQuotation(result.quotation, result.message, null);
      } else {
        setMessage(result.message || "Failed to remove discount.");
        setIsError(true);
      }
    } catch (error) {
      setMessage("An unexpected error occurred during discount removal.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mt-6">
      <label className="block text-sm font-bold text-black mb-2">
        Discount Code
      </label>

      {isDiscountApplied && currentQuotation ? (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg max-w-md">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-green-700" />
            <span className="text-sm font-bold text-green-800">
              {currentQuotation.discountCode} Applied
            </span>
          </div>
          <button
            onClick={handleRemoveDiscount}
            disabled={isLoading}
            className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
          >
            <X className="w-4 h-4" /> Remove
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-black focus:border-[#1a7c4c] focus:outline-none focus:ring-1 focus:ring-[#1a7c4c]"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !code}
            className="rounded-md bg-gradient-to-r from-[#367D5E] to-[#53C090] px-6 py-2.5 text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
          >
            {isLoading ? "..." : "Apply"}
          </button>
        </form>
      )}

      {message && !isDiscountApplied && (
        <p
          className={`mt-2 text-sm ${isError ? "text-red-500" : "text-[#367D5E] font-medium"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
