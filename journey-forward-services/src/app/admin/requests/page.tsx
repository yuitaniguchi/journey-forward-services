"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { RequestStatus } from "@prisma/client";
import StatusBadge from "@/components/admin/StatusBadge";

type AdminRequest = {
  id: number;
  status: RequestStatus;
  preferredDatetime: string;
  customer?: {
    firstName: string;
    lastName: string;
  } | null;
  quotation?: {
    total: string; // Prisma の Decimal が API 経由で string になっている想定
  } | null;
};

type StatusFilter = "ALL" | RequestStatus;

const STATUS_OPTIONS: StatusFilter[] = [
  "ALL",
  "RECEIVED",
  "QUOTED",
  "CONFIRMED",
  "INVOICED",
  "PAID",
  "CANCELLED",
];

export default function AdminRequestListPage() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [error, setError] = useState<string | null>(null);

  // ① マウント時に /api/bookings から一覧を取得
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch("/api/bookings");
        if (!res.ok) {
          throw new Error("Failed to fetch bookings");
        }
        const json = await res.json();
        setRequests(json.data as AdminRequest[]);
      } catch (err) {
        console.error(err);
        setError("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // ② 検索 & ステータスフィルタを適用した配列を計算
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      searchId.trim() === "" || req.id.toString().includes(searchId.trim());

    const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatPickup = (iso: string) => {
    const date = new Date(iso);
    // ここはシンプルに英語フォーマットで
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Requests</h1>

      {/* 検索バー */}
      <div className="flex justify-between items-center mb-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Search Requests
          </label>
          <input
            type="text"
            placeholder="Search by ID (e.g. 12345)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="border rounded-md px-3 py-2 w-72 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>
      </div>

      {/* ステータスフィルタのボタン */}
      <div className="mb-4">
        <p className="text-sm font-medium mb-2">Status:</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => {
            const isActive = statusFilter === option;
            const label =
              option === "ALL"
                ? "All"
                : option.charAt(0) + option.slice(1).toLowerCase();

            return (
              <button
                key={option}
                type="button"
                onClick={() => setStatusFilter(option)}
                className={
                  "px-4 py-2 rounded-full border text-sm font-medium transition " +
                  (isActive
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-900 border-slate-900/60 hover:bg-slate-100")
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ローディング & エラー */}
      {loading && <p>Loading requests...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* テーブル */}
      {!loading && !error && (
        <div className="mt-4 bg-slate-50 rounded-2xl shadow-sm overflow-hidden border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100">
              <tr className="text-left">
                <th className="px-6 py-3 border-b border-amber-400">ID</th>
                <th className="px-6 py-3 border-b border-amber-400">
                  Customer
                </th>
                <th className="px-6 py-3 border-b border-amber-400">Pickup</th>
                <th className="px-6 py-3 border-b border-amber-400">
                  Estimate
                </th>
                <th className="px-6 py-3 border-b border-amber-400">Status</th>
                <th className="px-6 py-3 border-b border-amber-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-6 text-center text-slate-500"
                  >
                    No requests found.
                  </td>
                </tr>
              )}

              {filteredRequests.map((req) => (
                <tr key={req.id} className="border-t border-amber-200">
                  {/* 🔗 ID をクリックで詳細ページへ */}
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/requests/${req.id}`}
                      className="text-slate-900 hover:underline"
                    >
                      #{req.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    {req.customer
                      ? `${req.customer.firstName} ${req.customer.lastName}`
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    {formatPickup(req.preferredDatetime)}
                  </td>
                  <td className="px-6 py-4">
                    {req.quotation?.total ? `$${req.quotation.total}` : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/requests/${req.id}`}
                      className="text-emerald-700 hover:underline font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
