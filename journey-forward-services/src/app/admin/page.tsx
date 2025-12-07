// src/app/admin/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { RequestStatus } from "@prisma/client";
import RequestCard from "@/components/admin/RequestCard";
import StatusBadge from "@/components/admin/StatusBadge";
import Link from "next/link";

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

function formatPickupDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

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
            const isActive = statusFilter === tab.value;

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
                    ? "bg-emerald-900 text-white border-emerald-900"
                    : "bg-white text-slate-900 border-slate-300 hover:bg-emerald-900 hover:text-white")
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Error */}
      {error && (
        <p className="mt-2 text-sm font-semibold text-red-600">
          {error || "Failed to load requests"}
        </p>
      )}

      {/* Loading */}
      {loading && !error && (
        <p className="mt-4 text-slate-500">Loading requests...</p>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <p className="mt-4 text-slate-500">No requests found</p>
      )}

      {/* Desktop: table */}
      {!loading && !error && filtered.length > 0 && (
        <>
          <section className="mt-4 hidden md:block">
            <div className="w-full overflow-x-hidden rounded-3xl border border-slate-200 bg-[#f3f7fc] shadow-sm">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-[#f3f7fc] text-left text-sm font-semibold text-slate-900 md:text-base">
                    <th className="rounded-tl-3xl px-8 py-4">ID</th>
                    <th className="px-4 py-4">Customer</th>
                    <th className="px-4 py-4">Pickup</th>
                    <th className="px-4 py-4">Estimate</th>
                    <th className="px-4 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Orange line */}
                  <tr>
                    <td
                      colSpan={5}
                      className="border-b border-[#f6b55f] border-t-2 bg-white"
                    />
                  </tr>

                  {filtered.map((req) => (
                    <RequestCard key={req.id} request={req} />
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Mobile: card list */}
          <section className="mt-4 space-y-3 md:hidden">
            {filtered.map((req) => {
              const customerName = `${req.customer.firstName} ${req.customer.lastName}`;
              const pickup = formatPickupDate(req.preferredDatetime);
              const estimate = req.quotation ? `$${req.quotation.total}` : "-";

              return (
                <Link
                  key={req.id}
                  href={`/admin/requests/${req.id}`}
                  className="block rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:bg-slate-50 active:bg-slate-100"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      #{req.id}
                    </p>
                    <StatusBadge status={req.status} />
                  </div>

                  <div className="space-y-1 text-sm text-slate-800">
                    <p>
                      <span className="font-semibold">Customer: </span>
                      {customerName}
                    </p>
                    <p>
                      <span className="font-semibold">Pickup: </span>
                      {pickup}
                    </p>
                    <p>
                      <span className="font-semibold">Estimate: </span>
                      {estimate}
                    </p>
                  </div>
                </Link>
              );
            })}
          </section>
        </>
      )}
    </>
  );
}
