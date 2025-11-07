import React from "react";

interface Option {
    /** Value of the option */
    value: string;
    /** Display label for the option */
    label: string;
  }
  
  interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    /** Optional label displayed above the select */
    label?: string;
    /** Array of options to display in the dropdown */
    options: Option[];
    /** Optional error message to display below the select */
    error?: string;
  }

export default function Select({ label, options, error, className = "", ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-sm font-medium text-[#22503B]">
          {label}
        </label>
      )}

      <select
        {...props}
        className={`w-full rounded-md border px-3 py-2 text-[#22503B] bg-white focus:outline-none focus:ring-2 transition-colors duration-150 ease-in-out ${
          error
            ? "border-[#F44336] focus:ring-[#F44336]"
            : "border-[#367D5E] focus:ring-[#BFEEEE]"
        } ${className}`}
      >
        <option value="">select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <p className="mt-1 text-sm text-[#F44336]">{error}</p>}
    </div>
  );
}