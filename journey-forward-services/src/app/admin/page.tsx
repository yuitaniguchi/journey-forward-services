import { prisma } from "@/lib/prisma";
import type { RequestStatus } from "@prisma/client";
import AdminRequestsClient, {
  RequestWithRelations,
} from "@/components/admin/AdminRequestsClient";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const rawRequests = await prisma.request.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      quotation: {
        select: {
          total: true,
        },
      },
    },
  });

  const requests: RequestWithRelations[] = rawRequests.map((r) => ({
    id: r.id,
    status: r.status as RequestStatus,
    preferredDatetime: r.preferredDatetime.toISOString(),
    customer: {
      firstName: r.customer.firstName,
      lastName: r.customer.lastName,
    },
    quotation: r.quotation
      ? {
          total: r.quotation.total.toString(),
        }
      : null,
  }));

  return <AdminRequestsClient initialRequests={requests} />;
}
