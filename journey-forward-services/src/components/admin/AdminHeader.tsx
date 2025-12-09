// src/components/admin/AdminHeader.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminHeader() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [menuOpen, setMenuOpen] = useState(false);

  // ログインページではメニュー自体を出さないので、開いていたら閉じる
  if (isLoginPage && menuOpen) {
    setMenuOpen(false);
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 md:px-12">
        {/* 左：タイトル（+必要ならロゴ） */}
        <h1 className="text-base font-semibold text-slate-900 md:text-lg">
          Journey Forward Admin
        </h1>

        {/* 右：PCナビ（md以上） */}
        {!isLoginPage && (
          <nav className="hidden items-center gap-4 md:flex">
            <Link
              href="/admin/users"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              Users
            </Link>
            <Link
              href="/admin/profile"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              Change Password
            </Link>
            <LogoutButton />
          </nav>
        )}

        {/* 右：モバイル用ハンバーガー（md未満） */}
        {!isLoginPage && (
          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          >
            <span className="sr-only">Open admin navigation</span>
            <div className="space-y-1">
              <span className="block h-0.5 w-5 rounded bg-slate-700" />
              <span className="block h-0.5 w-5 rounded bg-slate-700" />
              <span className="block h-0.5 w-5 rounded bg-slate-700" />
            </div>
          </button>
        )}
      </div>

      {/* モバイルメニュー（md未満でのみ表示） */}
      {!isLoginPage && menuOpen && (
        <nav className="border-t border-slate-200 bg-white md:hidden">
          <div className="space-y-1 px-6 py-3">
            <Link
              href="/admin/users"
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              Users
            </Link>
            <Link
              href="/admin/profile"
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              Change Password
            </Link>
            <div className="mt-2 px-3">
              <LogoutButton />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
