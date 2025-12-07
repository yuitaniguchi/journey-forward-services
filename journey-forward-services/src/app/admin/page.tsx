// src/app/admin/page.tsx
import { prisma } from "@/lib/prisma";
import type { RequestStatus } from "@prisma/client";
import AdminRequestsClient, {
  RequestWithRelations,
} from "@/components/admin/AdminRequestsClient";

export default async function AdminRequestsPage() {
  // 1. サーバ側で DB からデータ取得
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

  // 2. クライアントに渡せる形に整形（Date / Decimal → string など）
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

  // 3. クライアントコンポーネントにデータを渡して描画
  return <AdminRequestsClient initialRequests={requests} />;
}
