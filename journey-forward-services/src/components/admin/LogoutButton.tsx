"use client";

import { useState } from "react";

interface LogoutButtonProps {
  className?: string;
  isMobile?: boolean;
}

export default function LogoutButton({
  className = "",
  isMobile = false,
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (!res.ok) {
        alert("Failed to logout.");
        return;
      }
      window.location.href = "/admin/login";
    } catch (e) {
      console.error(e);
      alert("Error during logout.");
    } finally {
      setLoading(false);
    }
  };

  const desktopClasses =
    "text-md font-medium text-slate-700 transition-colors hover:text-brand";

  const mobileClasses =
    "block w-full text-left text-sm font-medium text-slate-700 transition-colors hover:text-brand";

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`${isMobile ? mobileClasses : desktopClasses} ${className}`}
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
