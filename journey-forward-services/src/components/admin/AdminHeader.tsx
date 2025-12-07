// src/components/admin/AdminHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminHeader() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <header className="flex items-center justify-between border-b border-slate-200 px-6 py-3 md:px-12">
      <h1 className="text-lg font-semibold text-slate-900">
        Journey Forward Admin
      </h1>

      {!isLoginPage && (
        <div className="flex items-center gap-4">
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
        </div>
      )}
    </header>
  );
}
