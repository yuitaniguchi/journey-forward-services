import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      className="inline-flex items-center justify-center rounded-md bg-[#367D5E] px-4 py-2 font-medium text-white transition-transform duration-150 ease-in-out hover:scale-[1.03] hover:bg-[#57AF82] active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-[#BFEEEE]"
      {...props}
    >
      {children}
    </button>
  );
}