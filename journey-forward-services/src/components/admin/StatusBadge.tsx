import type { RequestStatus } from "@prisma/client";

type Props = {
  status: RequestStatus;
};

const STATUS_STYLES: Record<RequestStatus, string> = {
  RECEIVED: "bg-blue-100 text-blue-800",
  QUOTED: "bg-purple-100 text-purple-800",
  CONFIRMED: "bg-yellow-100 text-yellow-800",
  INVOICED: "bg-orange-100 text-orange-800",
  PAID: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export default StatusBadge;
