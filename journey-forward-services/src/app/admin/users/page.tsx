// src/app/admin/users/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type AdminUser = {
  id: number;
  username: string;
  email: string;
  createdAt: string;
};

type CreateUserModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (user: AdminUser) => void;
};

type EditUserModalProps = {
  open: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onUpdated: (user: AdminUser) => void;
};

type DeleteModalProps = {
  open: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onDeleted: (id: number) => void;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  // 一覧読み込み
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/users");
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Failed to load admin users.");
        } else {
          setUsers(json.admins ?? []);
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load admin users.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const hasUsers = useMemo(() => users.length > 0, [users]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
          Admin Users
        </h1>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Create Admin User
        </button>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="text-left text-sm font-semibold text-slate-900 md:text-base">
              <th className="rounded-tl-3xl px-6 py-4">ID</th>
              <th className="px-4 py-4">Username</th>
              <th className="px-4 py-4">Email</th>
              <th className="px-4 py-4">Created</th>
              <th className="rounded-tr-3xl px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* 上部の線 */}
            <tr>
              <td
                colSpan={5}
                className="border-b border-[#f6b55f] border-t-2 bg-[#f3f7fc]"
              />
            </tr>

            {loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-slate-500"
                >
                  Loading admin users...
                </td>
              </tr>
            )}

            {!loading && !hasUsers && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-slate-500"
                >
                  No admin users found.
                </td>
              </tr>
            )}

            {!loading &&
              users.map((u) => (
                <tr key={u.id} className="bg-white text-sm text-slate-900">
                  <td className="px-6 py-3 font-semibold">#{u.id}</td>
                  <td className="px-4 py-3">{u.username}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingUser(u)}
                        className="rounded-full border border-slate-300 px-4 py-1 text-xs font-semibold text-slate-900 hover:bg-slate-900 hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingUser(u)}
                        className="rounded-full border border-red-500 px-4 py-1 text-xs font-semibold text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {error && (
          <p className="px-6 pb-6 pt-3 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}
      </section>

      {/* Create Modal */}
      <CreateUserModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(user) => {
          setUsers((prev) => [...prev, user]);
        }}
      />

      {/* Edit Modal */}
      <EditUserModal
        open={editingUser !== null}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUpdated={(user) => {
          setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
        }}
      />

      {/* Delete Modal */}
      <DeleteUserModal
        open={deletingUser !== null}
        user={deletingUser}
        onClose={() => setDeletingUser(null)}
        onDeleted={(id) => {
          setUsers((prev) => prev.filter((u) => u.id !== id));
        }}
      />
    </div>
  );
}

/* ---------- CreateUserModal ---------- */

function CreateUserModal({ open, onClose, onCreated }: CreateUserModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setUsername("");
      setEmail("");
      setPassword("");
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username || !email || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to create admin user.");
        return;
      }

      onCreated(json.admin);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white px-8 py-8 shadow-xl">
        <div className="mb-6 flex items-start justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            Create Admin User
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-slate-500 hover:text-slate-900"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-900">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-900">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-900">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create user"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------- EditUserModal ---------- */

function EditUserModal({ open, user, onClose, onUpdated }: EditUserModalProps) {
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      setUsername(user.username);
      setEmail(user.email);
      setNewPassword("");
      setError(null);
    }
  }, [open, user]);

  if (!open || !user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username || !email) {
      setError("Username and email are required.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          newPassword: newPassword || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to update admin user.");
        return;
      }

      onUpdated(json.admin);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white px-8 py-8 shadow-xl">
        <div className="mb-6 flex items-start justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Edit Admin User</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-slate-500 hover:text-slate-900"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-900">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-900">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-900">
              New password (optional)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Leave blank to keep current password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Updating..." : "Update user"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------- DeleteUserModal ---------- */

function DeleteUserModal({ open, user, onClose, onDeleted }: DeleteModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  if (!open || !user) return null;

  async function handleDelete() {
    setError(null);
    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to delete admin user.");
        return;
      }
      onDeleted(user.id);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white px-8 py-8 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            Delete admin user?
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-slate-500 hover:text-slate-900"
          >
            ×
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-700">
          Are you sure you want to delete this admin user?
        </p>
        <p className="mb-4 text-sm font-semibold text-slate-900">
          {user.username} &lt;{user.email}&gt;
        </p>
        <p className="mb-6 text-xs text-slate-500">
          This action cannot be undone. You cannot delete your own account.
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row">
          <button
            type="button"
            disabled={submitting}
            onClick={handleDelete}
            className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Deleting..." : "Delete"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
