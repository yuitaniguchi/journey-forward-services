import React, { useState, useRef, useEffect } from "react";

interface Option {
  /** Value of the option */
  value: string;
  /** Display label for the option */
  label: string;
}

interface SelectProps {
  /** Optional label displayed above the select */
  label?: string;
  /** Array of options to display in the dropdown */
  options: Option[];
  /** Selected value */
  value?: string;
  /** Callback when value changes */
  onChange?: (value: string) => void;
  /** Optional error message to display below the select */
  error?: string;
  /** Additional Tailwind classes */
  className?: string;
}

export default function Select({
  label,
  options,
  value,
  onChange,
  error,
  className = "",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (val: string) => {
    onChange?.(val);
    setIsOpen(false);
  };

  const selectedLabel = options.find((opt) => opt.value === value)?.label || "";

  return (
    <div className={`w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-[#22503B]">{label}</label>
      )}

      <div className="relative">
        {/* Select display */}
        <div
          className={`w-full rounded-md border px-4 py-2 pr-10 bg-white text-[#22503B] cursor-pointer flex items-center justify-between ${
            error ? "border-[#F44336]" : "border-[#367D5E]"
          } focus:outline-none focus:ring-2 focus:ring-[#BFEEEE] transition-colors duration-150 ease-in-out`}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span>{selectedLabel || "Select an option"}</span>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Dropdown options */}
        {isOpen && (
          <ul className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border border-[#367D5E] bg-white shadow-lg">
            {options.map((opt) => (
              <li
                key={opt.value}
                className={`px-4 py-2 cursor-pointer hover:bg-[#BFEEEE] ${
                  opt.value === value ? "bg-[#BFEEEE] font-semibold" : ""
                }`}
                onMouseDown={(e) => e.preventDefault()} // prevent focus loss
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-[#F44336]">{error}</p>}
    </div>
  );
}