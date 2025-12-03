'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/admin';

  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [loading, setL] = useState(false);
  const [error, setE] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setE(null);
    setL(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setE(data?.error || 'Login failed');
        setL(false);
        return;
      }
      router.replace(next);
    } catch {
      setE('Network error');
      setL(false);
    }
  };

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl border border-slate-300 rounded-2xl shadow-md bg-white px-10 py-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 text-center">
              Admin Login
            </h1>
            <p className="mt-3 text-center text-slate-500">
              Sign in to access the admin dashboard
            </p>

            <form onSubmit={onSubmit} className="mt-10 space-y-6">
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
                <input
                  type="password"
                  className="w-full rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 px-4 py-3 placeholder-slate-400"
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
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <p className="text-center text-slate-400 text-sm">
                Demo credentials: <strong>admin</strong> /{' '}
                <strong>admin</strong>
              </p>
            </form>
          </div>
        </div>
      </body>
    </html>
  );
}
