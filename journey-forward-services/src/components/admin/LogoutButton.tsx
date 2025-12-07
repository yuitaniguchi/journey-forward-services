// src/components/admin/LogoutButton.tsx
"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const res = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (!res.ok) {
        console.error("Failed to logout:", await res.text());
        alert("Failed to logout. Please try again.");
        return;
      }

      // ログアウトできたら、ログインページ or /admin/login に飛ばす想定
      window.location.href = "/admin/login";
    } catch (e) {
      console.error("Unexpected logout error:", e);
      alert("Unexpected error during logout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="text-sm font-semibold text-slate-700 hover:text-slate-900"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
