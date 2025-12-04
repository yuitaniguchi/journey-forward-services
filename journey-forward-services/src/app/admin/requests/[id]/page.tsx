"use client";

import { use as usePromise, useEffect, useState } from "react";
import type { RequestStatus } from "@prisma/client";
import QuotationModal from "@/components/admin/QuotationModal";
import FinalAmountModal from "@/components/admin/FinalAmountModal";

type RequestDetail = {
  id: number;
  status: RequestStatus;
  preferredDatetime: string;
  deliveryRequired: boolean;

  pickupPostalCode: string;
  pickupAddressLine1: string;
  pickupAddressLine2?: string | null;
  pickupCity: string;
  pickupState: string;
  pickupFloor?: number | null;
  pickupElevator?: boolean | null;

  deliveryPostalCode?: string | null;
  deliveryAddressLine1?: string | null;
  deliveryAddressLine2?: string | null;
  deliveryCity?: string | null;
  deliveryState?: string | null;
  deliveryFloor?: number | null;
  deliveryElevator?: boolean | null;

  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };

  items: {
    id: number;
    name: string;
    description?: string | null;
    size: string;
    quantity: number;
    photoUrl?: string | null;
  }[];

  quotation: {
    id: number;
    subtotal: number;
    tax: number;
    total: number;
  } | null;

  payment: {
    id: number;
    total: string;
    status: string;
  } | null;
};

const STATUS_FLOW: RequestStatus[] = [
  "RECEIVED",
  "QUOTED",
  "CONFIRMED",
  "INVOICED",
  "PAID",
];

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function RequestDetailPage({ params }: PageProps) {
  const { id: requestId } = usePromise(params);
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showFinalAmountModal, setShowFinalAmountModal] = useState(false);

  //detail infomation
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/bookings/${requestId}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Failed to load request");
        } else {
          setRequest(json.data as RequestDetail);
        }
      } catch {
        setError("Failed to load request");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [requestId]);

  // data formatting
  function formatDate(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // update status
  async function handleStatusChange(next: RequestStatus) {
    if (!request) return;
    if (next === request.status) return;

    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/bookings/${request.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Failed to update status");
        return;
      }

      // update local state
      setRequest((prev) =>
        prev ? { ...prev, status: json.data.status as RequestStatus } : prev
      );
    } catch {
      alert("Network error");
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8faf9] px-6 py-8 md:px-12 md:py-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8">
          Request Details
        </h1>
        <p className="text-slate-500">Loading request...</p>
      </main>
    );
  }

  if (error || !request) {
    return (
      <main className="min-h-screen bg-[#f8faf9] px-6 py-8 md:px-12 md:py-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8">
          Request Details
        </h1>
        <p className="text-red-600 font-semibold">
          {error || "Request not found"}
        </p>
      </main>
    );
  }

  const customerName = `${request.customer.firstName} ${request.customer.lastName}`;
  const pickupDate = formatDate(request.preferredDatetime);
  const estimate =
    request.quotation && request.quotation.total
      ? `$${request.quotation.total}`
      : "-";
  const finalAmount =
    request.payment && request.payment.total
      ? `$${request.payment.total}`
      : "-";

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(val);

  return (
    <main className="min-h-screen bg-[#f8faf9] px-6 py-8 md:px-12 md:py-10">
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8">
        Request Details
      </h1>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 1. Customer */}
        <section className="bg-white border border-slate-300 rounded-3xl px-8 py-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Customer
          </h2>
          <p className="mb-2">
            <span className="font-semibold">Name: </span>
            {customerName}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Email: </span>
            {request.customer.email}
          </p>
          <p>
            <span className="font-semibold">Phone: </span>
            {request.customer.phone || "-"}
          </p>
        </section>

        {/* 2. Status Management */}
        <section className="bg-white border border-slate-300 rounded-3xl px-8 py-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Status Management
          </h2>

          <div className="flex flex-wrap gap-3 mb-4">
            {STATUS_FLOW.map((s) => {
              const active = request.status === s;
              const label = s.charAt(0) + s.slice(1).toLowerCase();

              return (
                <button
                  key={s}
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange(s)}
                  className={
                    "rounded-full px-6 py-2 text-sm font-semibold border transition " +
                    (active
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-900 border-slate-300 hover:bg-slate-900 hover:text-white")
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>

          <p className="mt-6 text-base md:text-lg text-slate-900">
            <span className="font-semibold mr-2">Current Status:</span>
            <span className="inline-block px-3 py-1 font-extrabold">
              {request.status.charAt(0) + request.status.slice(1).toLowerCase()}
            </span>
          </p>
        </section>

        {/* 3. Booking */}
        <section className="bg-white border border-slate-300 rounded-3xl px-8 py-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Booking
          </h2>
          <p className="mb-2">
            <span className="font-semibold">Address: </span>
            {request.pickupAddressLine1}
            {request.pickupAddressLine2
              ? `, ${request.pickupAddressLine2}`
              : ""}
            , {request.pickupCity}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Preferred: </span>
            {pickupDate}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Elevator: </span>
            {request.pickupElevator === null
              ? "-"
              : request.pickupElevator
                ? "Yes"
                : "No"}
            {"  /  "}
            <span className="font-semibold">Floor: </span>
            {request.pickupFloor ?? "-"}
          </p>

          {request.deliveryRequired && (
            <div className="mt-4">
              <h3 className="font-semibold mb-1">Delivery</h3>
              <p className="mb-1">
                <span className="font-semibold">Address: </span>
                {request.deliveryAddressLine1}
                {request.deliveryAddressLine2
                  ? `, ${request.deliveryAddressLine2}`
                  : ""}
                , {request.deliveryCity}
              </p>
              <p>
                <span className="font-semibold">Elevator: </span>
                {request.deliveryElevator === null
                  ? "-"
                  : request.deliveryElevator
                    ? "Yes"
                    : "No"}
                {"  /  "}
                <span className="font-semibold">Floor: </span>
                {request.deliveryFloor ?? "-"}
              </p>
            </div>
          )}
        </section>

        {/* 4. Quotation */}
        <section className="bg-white border border-slate-300 rounded-3xl px-8 py-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Quotation
          </h2>

          {request.quotation ? (
            <div className="mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-medium">
                  {formatCurrency(request.quotation.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax (12%):</span>
                <span className="font-medium">
                  {formatCurrency(request.quotation.tax)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
                <span>Total:</span>
                <span>{formatCurrency(request.quotation.total)}</span>
              </div>
            </div>
          ) : (
            <p className="mb-4 text-slate-500">No quotation created yet.</p>
          )}

          <button
            type="button"
            onClick={() => setShowQuotationModal(true)}
            className="w-full rounded-xl border border-slate-900 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-900 hover:text-white transition"
          >
            {request.quotation ? "Edit Quotation" : "Create Quotation"}
          </button>
        </section>

        {/* 5. Items & Photos */}
        <section className="bg-white border border-slate-300 rounded-3xl px-8 py-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Items &amp; Photos
          </h2>
          {request.items.length === 0 && (
            <p className="text-slate-500">No items registered.</p>
          )}

          <ul className="space-y-4">
            {request.items.map((item) => (
              <li key={item.id} className="flex gap-4 items-start">
                {item.photoUrl && (
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover border border-slate-200"
                  />
                )}
                <div>
                  <p className="font-semibold">
                    {item.name} - {item.size} (x{item.quantity})
                  </p>
                  {item.description && (
                    <p className="text-sm text-slate-600">{item.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 6. Final Billing */}
        <section className="bg-white border border-slate-300 rounded-3xl px-8 py-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Final Billing
          </h2>
          <p className="mb-4">
            <span className="font-semibold">Final Amount: </span>
            {finalAmount}
          </p>
          <button
            type="button"
            onClick={() => setShowFinalAmountModal(true)}
            className="w-full rounded-xl bg-emerald-900 py-2 text-sm font-semibold text-white hover:bg-emerald-950 transition"
          >
            Send Final Amount
          </button>
        </section>
      </div>

      {/* Quotation Modal */}
      <QuotationModal
        open={showQuotationModal}
        initialSubtotal={request.quotation?.subtotal ?? 0}
        onClose={() => setShowQuotationModal(false)}
        onSave={async ({ subtotal, sendEmail }) => {
          try {
            const res = await fetch(`/api/admin/quotations/${request.id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subtotal,
                sendEmail,
              }),
            });

            const json = await res.json();

            if (!res.ok) {
              alert(json.error || "Failed to save quotation.");
              throw new Error(json.error);
            }

            setRequest((prev) =>
              prev
                ? {
                    ...prev,
                    quotation: {
                      id: json.quotation.id,
                      subtotal: Number(json.quotation.subtotal),
                      tax: Number(json.quotation.tax),
                      total: Number(json.quotation.total),
                    },
                    status:
                      prev.status === "RECEIVED" || prev.status === "QUOTED"
                        ? "QUOTED"
                        : prev.status,
                  }
                : prev
            );
          } catch (e) {
            console.error(e);
            throw e;
          }
        }}
      />

      {/* Final Amount Modal */}
      <FinalAmountModal
        open={showFinalAmountModal}
        initialAmount={request.payment?.total ?? ""}
        initialBreakdown=""
        onClose={() => setShowFinalAmountModal(false)}
        onSend={async ({ amount, breakdown }) => {
          const total = Number(amount);
          if (Number.isNaN(total) || total < 0) {
            alert("Final amount must be a non-negative number.");
            throw new Error("Invalid final amount");
          }

          try {
            const res = await fetch(
              `/api/admin/payments/${request.id}/finalize`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  subtotal: total,
                  tax: 0,
                  total,
                  currency: "CAD",
                }),
              }
            );

            const json = await res.json();

            if (!res.ok) {
              console.error("Failed to finalize payment:", json);
              alert(json.error || "Failed to finalize payment amount.");
              throw new Error(json.error || "Finalize API error");
            }

            const payment = json.payment;

            setRequest((prev) =>
              prev
                ? {
                    ...prev,
                    payment: {
                      id: payment.id,
                      total: payment.total,
                      status: payment.status,
                    },
                    status: "INVOICED",
                  }
                : prev
            );
          } catch (e) {
            console.error("Network or finalize error:", e);
            throw e;
          }
        }}
      />
    </main>
  );
}
