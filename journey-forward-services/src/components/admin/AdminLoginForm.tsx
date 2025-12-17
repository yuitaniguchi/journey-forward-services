// src/components/admin/AdminLoginForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminFormCard from "@/components/admin/AdminFormCard";
import PasswordInput from "@/components/admin/PasswordInput"; // 目アイコン付き

type Props = {
  next: string;
};

export default function AdminLoginForm({ next }: Props) {
  const router = useRouter();

  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [loading, setL] = useState(false);
  const [error, setE] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setE(null);
    setL(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setE(data?.error || "Login failed");
        setL(false);
        return;
      }
      window.location.href = next;
    } catch {
      setE("Network error");
      setL(false);
    }
  };

  return (
    <AdminFormCard
      title="Admin Login"
      subtitle="Sign in to access the admin dashboard"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-slate-700 mb-2">Username</label>
          <input
            className="w-full rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 px-4 py-3 placeholder-slate-400"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setU(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div>
          <label className="block text-slate-700 mb-2">Password</label>
          <PasswordInput
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setP(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-medium py-3 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </AdminFormCard>
  );
}
