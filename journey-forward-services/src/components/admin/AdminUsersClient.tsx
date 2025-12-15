"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/admin/PasswordInput";

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  createdAt: string;
};

type AdminUsersClientProps = {
  initialUsers: AdminUser[];
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

export default function AdminUsersClient({
  initialUsers,
}: AdminUsersClientProps) {
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>(initialUsers);

  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  const hasUsers = useMemo(() => users.length > 0, [users]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
          Admin Users
        </h1>

        <div className="flex flex-col items-stretch gap-2 md:items-end">
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-full bg-emerald-800 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            Create Admin User
          </button>
        </div>
      </div>

      <section className="space-y-4">
        {!hasUsers && (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-8 text-center text-slate-500 shadow-sm">
            No admin users found.
          </div>
        )}

        {hasUsers &&
          users.map((u) => (
            <article
              key={u.id}
              className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm md:flex-row md:items-center"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  #{u.id}
                </p>
                <p className="text-lg font-bold text-slate-900">{u.username}</p>
                <p className="text-sm text-slate-700">{u.email}</p>
                <p className="text-xs text-slate-500">
                  Created:{" "}
                  {new Date(u.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 md:self-start">
                <button
                  type="button"
                  onClick={() => setEditingUser(u)}
                  className="rounded-full border border-emerald-800 px-4 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-900 hover:text-white"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => setDeletingUser(u)}
                  className="rounded-full border border-red-500 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-600 hover:text-white"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
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
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full rounded-xl bg-emerald-800 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      setUsername(user.username);
      setEmail(user.email);
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
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              placeholder="Enter email"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full rounded-xl bg-emerald-800 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
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
