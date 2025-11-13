

import React, { useEffect } from "react";

interface ModalProps {
    /** Controls whether the modal is open */
    isOpen: boolean;
    /** Callback function to close the modal */
    onClose: () => void;
    /** Optional title displayed at the top of the modal */
    title?: string;
    /** Content displayed inside the modal */
    children: React.ReactNode;
  }

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Close modal when pressing Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-lg bg-white border border-[#367D5E] shadow-lg transition-all duration-200 ease-out scale-100 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-[#367D5E] hover:text-[#22503B] text-xl font-semibold focus:outline-none"
          aria-label="Cerrar"
        >
          ×
        </button>

        {/* Title */}
        {title && (
          <div className="px-5 pt-5 pb-2 border-b border-[#BFEEEE] text-lg font-semibold text-[#22503B]">
            {title}
          </div>
        )}

        {/* Body */}
        <div className="px-5 py-4 text-[#22503B]">{children}</div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}