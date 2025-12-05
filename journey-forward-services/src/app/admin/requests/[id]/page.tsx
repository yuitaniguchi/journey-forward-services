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

  const [pendingStatus, setPendingStatus] = useState<RequestStatus | null>(
    null
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmingStatus, setConfirmingStatus] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

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

  function formatStatusLabel(s: RequestStatus) {
    return s.charAt(0) + s.slice(1).toLowerCase();
  }

  async function handleStatusChange(next: RequestStatus): Promise<boolean> {
    if (!request) return false;
    if (next === request.status) return true;

    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/bookings/${request.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json();
      if (!res.ok) {
        console.error("Failed to update status:", json);
        return false;
      }

      setRequest((prev) =>
        prev ? { ...prev, status: json.data.status as RequestStatus } : prev
      );
      return true;
    } catch (e) {
      console.error("Network error while updating status:", e);
      return false;
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleConfirmStatusChange() {
    if (!pendingStatus) return;

    setConfirmingStatus(true);
    setConfirmError(null);

    const ok = await handleStatusChange(pendingStatus);

    if (!ok) {
      setConfirmError("Failed to update status. Please try again.");
      setConfirmingStatus(false);
      return;
    }

    setConfirmingStatus(false);
    setIsConfirmModalOpen(false);
    setPendingStatus(null);
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
              const label = formatStatusLabel(s);

              return (
                <button
                  key={s}
                  type="button"
                  disabled={updatingStatus || s === request.status}
                  onClick={() => {
                    if (s === request.status) return;
                    setPendingStatus(s);
                    setConfirmError(null);
                    setIsConfirmModalOpen(true);
                  }}
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
              {formatStatusLabel(request.status)}
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

      {/* Status Change Confirm Modal */}
      {isConfirmModalOpen && pendingStatus && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white px-8 py-8 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Change status?
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (confirmingStatus) return;
                  setIsConfirmModalOpen(false);
                  setPendingStatus(null);
                  setConfirmError(null);
                }}
                className="text-2xl leading-none text-slate-500 hover:text-slate-900"
              >
                ×
              </button>
            </div>

            <p className="mb-4 text-sm text-slate-700">
              Are you sure you want to change the status for this request?
            </p>

            <div className="mb-4 space-y-1 text-sm text-slate-900">
              <p>
                <span className="font-semibold">Current status: </span>
                {formatStatusLabel(request.status)}
              </p>
              <p>
                <span className="font-semibold">New status: </span>
                {formatStatusLabel(pendingStatus)}
              </p>
            </div>

            <p className="mb-6 text-xs text-slate-500">
              This change may trigger follow-up actions such as emails or
              payment flows.
            </p>

            {confirmError && (
              <p className="mb-4 text-sm text-red-600">{confirmError}</p>
            )}

            <div className="flex flex-col gap-3 md:flex-row">
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={confirmingStatus}
                className="flex-1 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-950 transition disabled:opacity-60"
              >
                {confirmingStatus ? "Updating..." : "Yes, change status"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmingStatus) return;
                  setIsConfirmModalOpen(false);
                  setPendingStatus(null);
                  setConfirmError(null);
                }}
                className="flex-1 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
        initialSubtotal={request.quotation?.subtotal ?? 0}
        onClose={() => setShowFinalAmountModal(false)}
        onSend={async ({ subtotal }) => {
          if (subtotal < 0) {
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
                  subtotal,
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
