// src/components/admin/AdminProfileForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminFormCard from "@/components/admin/AdminFormCard";
import PasswordInput from "@/components/admin/PasswordInput";

export default function AdminProfileForm() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/admin/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to update password.");
        return;
      }

      setSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Change password error:", err);
      setError("Unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-4 py-6 md:px-12 md:py-10">
      {/* 🔙 画面右上・カードの外の Back ボタン */}
      <div className="mx-auto mb-4 flex max-w-5xl justify-end">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
        >
          Back to requests
        </button>
      </div>

      {/* ここから下が、中央の Change Password カード */}
      <AdminFormCard
        title="Change Password"
        subtitle="Update your admin password. Make sure to choose a strong password that you don't use elsewhere."
      >
        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Current password
            </label>
            <PasswordInput
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              New password
            </label>
            <PasswordInput
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Confirm new password
            </label>
            <PasswordInput
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full rounded-xl bg-emerald-800 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Updating..." : "Update password"}
          </button>
        </form>
      </AdminFormCard>
    </div>
  );
}
