"use client";

import { useEffect, useMemo, useState } from "react";
import type { RequestStatus } from "@prisma/client";
import RequestCard from "@/components/admin/RequestCard";

type RequestWithRelations = {
  id: number;
  status: RequestStatus;
  preferredDatetime: string;
  customer: {
    firstName: string;
    lastName: string;
  };
  quotation: {
    total: string;
  } | null;
};

const STATUS_TABS: { label: string; value: RequestStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Received", value: "RECEIVED" },
  { label: "Quoted", value: "QUOTED" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Invoiced", value: "INVOICED" },
  { label: "Paid", value: "PAID" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "ALL">(
    "ALL"
  );

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/bookings");
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Failed to load requests");
        } else {
          setRequests(json.data ?? []);
        }
      } catch {
        setError("Failed to load requests");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((req) => {
      // Status filter
      if (statusFilter !== "ALL" && req.status !== statusFilter) {
        return false;
      }

      // ID search
      const trimmed = searchId.trim().replace("#", "");
      if (trimmed.length > 0) {
        return req.id.toString().includes(trimmed);
      }

      return true;
    });
  }, [requests, searchId, statusFilter]);

  return (
    <>
      {/* 👇 背景色と min-h-screen は layout 側に任せる */}
      {/* Title */}
      <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
        Requests
      </h1>

      {/* Search */}
      <section className="mb-6 max-w-xl">
        <label className="mb-2 block text-lg font-semibold text-slate-900">
          Search Requests
        </label>
        <input
          type="text"
          placeholder="Search by ID (e.g. 12345)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </section>

      {/* Status Filter */}
      <section className="mb-6">
        <p className="mb-3 text-base font-semibold text-slate-900">Status:</p>
        <div className="flex flex-wrap gap-3">
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.value;
            const isAll = tab.value === "ALL";
            const isActive = active || (isAll && statusFilter === "ALL");

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() =>
                  setStatusFilter(
                    tab.value === "ALL" ? "ALL" : (tab.value as RequestStatus)
                  )
                }
                className={
                  "rounded-full border px-7 py-2 text-sm font-semibold transition md:text-base " +
                  (isActive
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-900 border-slate-300 hover:bg-slate-900 hover:text-white")
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Table */}
      <section className="mt-4">
        <div className="w-full overflow-x-auto rounded-3xl border border-slate-200 bg-[#f3f7fc] shadow-sm">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-[#f3f7fc] text-left text-sm font-semibold text-slate-900 md:text-base">
                <th className="rounded-tl-3xl px-8 py-4">ID</th>
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Pickup</th>
                <th className="px-4 py-4">Estimate</th>
                <th className="px-4 py-4">Status</th>
                <th className="rounded-tr-3xl px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Orange line */}
              <tr>
                <td
                  colSpan={6}
                  className="border-b border-[#f6b55f] border-t-2 bg-white"
                />
              </tr>

              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-8 py-10 text-center text-slate-500"
                  >
                    Loading requests...
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-8 py-10 text-center text-slate-500"
                  >
                    No requests found
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((req) => (
                  <RequestCard key={req.id} request={req} />
                ))}
            </tbody>
          </table>
        </div>

        {error && (
          <p className="mt-4 text-sm font-semibold text-red-600">
            {error || "Failed to load requests"}
          </p>
        )}
      </section>
    </>
  );
}
