"use client";

import type { ReactNode } from "react";

type AdminFormCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function AdminFormCard({
  title,
  subtitle,
  children,
}: AdminFormCardProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl border border-slate-300 rounded-2xl shadow-md bg-white px-10 py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 text-center">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-center text-slate-500">{subtitle}</p>
        )}

        {/* フォーム本体 */}
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}
