"use client";

import type { RequestStatus } from "@prisma/client";

const STATUS_STYLES: Record<RequestStatus, { bg: string; text: string }> = {
  RECEIVED: {
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  QUOTED: {
    bg: "bg-purple-100",
    text: "text-purple-700",
  },
  CONFIRMED: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
  },
  INVOICED: {
    bg: "bg-orange-100",
    text: "text-orange-800",
  },
  PAID: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
  },
  CANCELLED: {
    bg: "bg-red-100",
    text: "text-red-700",
  },
};

const LABELS: Record<RequestStatus, string> = {
  RECEIVED: "Received",
  QUOTED: "Quoted",
  CONFIRMED: "Confirmed",
  INVOICED: "Invoiced",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

export default function StatusBadge({ status }: { status: RequestStatus }) {
  const style = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-4 py-1 text-xs md:text-sm font-semibold ${style.bg} ${style.text}`}
    >
      {LABELS[status]}
    </span>
  );
}
