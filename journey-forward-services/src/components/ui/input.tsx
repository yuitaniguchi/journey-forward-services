import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Optional label displayed above the input */
    label?: string;
    /** Optional error message displayed below the input */
    error?: string;
    /** Optional unique id for input and label association */
    id?: string;
  }

export default function Input({ label, error, id, className = "", ...props }: InputProps) {
  const inputId = id ?? `input-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-[#22503B]">
          {label}
        </label>
      )}

      <input
        id={inputId}
        {...props}
        className={`w-full rounded-md border px-3 py-2 text-[#22503B] placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors duration-150 ease-in-out ${
          error ? "border-[#F44336] focus:ring-[#F44336]" : "border-[#367D5E] focus:ring-[#BFEEEE]"
        } ${className}`}
      />

      {error && <p className="mt-1 text-sm text-[#F44336]">{error}</p>}
    </div>
  );
}