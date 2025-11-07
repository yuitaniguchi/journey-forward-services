import React from "react";

interface CardProps {
    /** Optional title displayed at the top of the card */
    title?: string;
    /** Main content of the card */
    children: React.ReactNode;
    /** Optional footer displayed at the bottom of the card */
    footer?: React.ReactNode;
    /** Optional additional Tailwind classes */
    className?: string;
  }

export default function Card({ title, children, footer, className = "" }: CardProps) {
  return (
    <div
      className={`w-full rounded-lg border border-[#367D5E] bg-white shadow-sm transition-all duration-150 ease-in-out hover:shadow-md ${className}`}
    >
      {title && (
        <div className="border-b border-[#BFEEEE] px-4 py-3 text-lg font-semibold text-[#22503B]">
          {title}
        </div>
      )}

      <div className="px-4 py-4 text-[#22503B]">{children}</div>

      {footer && (
        <div className="border-t border-[#BFEEEE] px-4 py-3 text-sm text-[#367D5E]">
          {footer}
        </div>
      )}
    </div>
  );
}
2