import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { RequestStatus } from "@prisma/client";
import RequestDetailClient, {
  RequestDetail,
} from "@/components/admin/RequestDetailClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const requestId = Number(id);

  if (Number.isNaN(requestId)) {
    notFound();
  }

  const data = await prisma.request.findUnique({
    where: { id: requestId },
    include: {
      customer: true,
      items: true,
      quotation: {
        include: {
          discountCode: true,
        },
      },
      payment: true,
    },
  });

  if (!data) {
    notFound();
  }

  const request: RequestDetail = {
    id: data.id,
    status: data.status as RequestStatus,
    preferredDatetime: data.preferredDatetime.toISOString(),
    deliveryRequired: data.deliveryRequired,

    pickupPostalCode: data.pickupPostalCode,
    pickupAddressLine1: data.pickupAddressLine1,
    pickupAddressLine2: data.pickupAddressLine2,
    pickupCity: data.pickupCity,
    pickupState: data.pickupState,
    pickupFloor: data.pickupFloor,
    pickupElevator: data.pickupElevator,

    deliveryPostalCode: data.deliveryPostalCode,
    deliveryAddressLine1: data.deliveryAddressLine1,
    deliveryAddressLine2: data.deliveryAddressLine2,
    deliveryCity: data.deliveryCity,
    deliveryState: data.deliveryState,
    deliveryFloor: data.deliveryFloor,
    deliveryElevator: data.deliveryElevator,

    customer: {
      firstName: data.customer.firstName,
      lastName: data.customer.lastName,
      email: data.customer.email,
      phone: data.customer.phone,
    },

    items: data.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      size: item.size,
      quantity: item.quantity,
      photoUrl: item.photoUrl,
    })),

    quotation: data.quotation
      ? {
          id: data.quotation.id,
          subtotal: Number(data.quotation.subtotal),
          originalSubtotal: Number(data.quotation.originalSubtotal),
          tax: Number(data.quotation.tax),
          total: Number(data.quotation.total),
          discountAmount: data.quotation.discountAmount
            ? Number(data.quotation.discountAmount)
            : 0,
          discountRule: data.quotation.discountCode
            ? {
                type: data.quotation.discountCode.type, // "FIXED_AMOUNT" | "PERCENTAGE"
                value: Number(data.quotation.discountCode.value),
              }
            : null,
          note: data.quotation.note ?? null,
          sentAt: data.quotation.sentAt
            ? data.quotation.sentAt.toISOString()
            : null,
          updatedAt: data.quotation.updatedAt.toISOString(),
        }
      : null,

    payment: data.payment
      ? {
          id: data.payment.id,
          total: data.payment.total.toString(),
          subtotal: Number(data.payment.subtotal),
          tax: Number(data.payment.tax),
          discountAmount: data.payment.discountAmount
            ? Number(data.payment.discountAmount)
            : 0,
          status: data.payment.status,
          note: data.payment.note ?? null,
          sentAt: data.payment.sentAt
            ? data.payment.sentAt.toISOString()
            : null,
          updatedAt: data.payment.updatedAt.toISOString(),
        }
      : null,
  };

  return <RequestDetailClient initialRequest={request} />;
}
