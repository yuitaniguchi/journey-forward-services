// src/app/admin/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link"; // 👈 追加
import LogoutButton from "@/components/admin/LogoutButton";

type Props = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: Props) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const isProfilePage = pathname === "/admin/profile";

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-3 md:px-12">
        <h1 className="text-lg font-semibold text-slate-900">
          Journey Forward Admin
        </h1>

        {/* 👇 ログインページ以外でだけ、Profile + Logout を表示 */}
        {!isLoginPage && (
          <div className="flex items-center gap-3">
            <Link
              href="/admin/profile"
              className={
                "rounded-full border px-4 py-1.5 text-sm font-semibold transition " +
                (isProfilePage
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-900 border-slate-300 hover:bg-slate-900 hover:text-white")
              }
            >
              Change Password
            </Link>

            <LogoutButton />
          </div>
        )}
      </header>

      {/* 中身はここに入る */}
      <main className="mx-auto px-6 py-8 md:px-12 md:py-10">{children}</main>
    </div>
  );
}
