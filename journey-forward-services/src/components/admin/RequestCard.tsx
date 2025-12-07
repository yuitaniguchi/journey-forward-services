"use client";

import { useRouter } from "next/navigation";
import type { RequestStatus } from "@prisma/client";
import StatusBadge from "./StatusBadge";

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

function formatPickupDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleString("en-US", {
    month: "short", // Nov
    day: "numeric", // 23
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function RequestCard({
  request,
}: {
  request: RequestWithRelations;
}) {
  const router = useRouter();

  const fullName = `${request.customer.firstName} ${request.customer.lastName}`;
  const pickup = formatPickupDate(request.preferredDatetime);
  const estimate = request.quotation ? `$${request.quotation.total}` : "-";

  return (
    <tr
      onClick={() => router.push(`/admin/requests/${request.id}`)}
      className="bg-white text-sm md:text-base text-slate-900 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50"
      role="button"
      tabIndex={0}
    >
      <td className="px-8 py-5 whitespace-nowrap align-middle">
        <span className="font-semibold text-slate-900">#{request.id}</span>
      </td>

      <td className="px-4 py-5 whitespace-nowrap align-middle">
        <span>{fullName}</span>
      </td>

      <td className="px-4 py-5 whitespace-nowrap align-middle">
        <span>{pickup}</span>
      </td>

      <td className="px-4 py-5 whitespace-nowrap align-middle">
        <span>{estimate}</span>
      </td>

      <td className="px-4 py-5 whitespace-nowrap align-middle">
        <StatusBadge status={request.status} />
      </td>
    </tr>
  );
}
