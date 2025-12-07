"use client";

import { use as usePromise, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  "CANCELLED",
];

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function RequestDetailPage({ params }: PageProps) {
  const { id: requestId } = usePromise(params);
  const router = useRouter();

  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showFinalAmountModal, setShowFinalAmountModal] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);

  const [pendingStatus, setPendingStatus] = useState<RequestStatus | null>(
    null
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmingStatus, setConfirmingStatus] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // 🔍 ライトボックス用 state
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [photoItems, setPhotoItems] = useState<RequestDetail["items"]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // ---- データ読み込み ----
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

  // ---- フォーマット系 ----
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

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(val);

  // ---- ステータス更新 ----
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

  // 🔁 ライトボックスの前後ナビゲーション
  function goPrevPhoto() {
    setCurrentPhotoIndex((i) =>
      photoItems.length === 0
        ? 0
        : (i - 1 + photoItems.length) % photoItems.length
    );
  }

  function goNextPhoto() {
    setCurrentPhotoIndex((i) =>
      photoItems.length === 0 ? 0 : (i + 1) % photoItems.length
    );
  }

  // 🔍 サムネイルクリック時のハンドラ
  function handlePhotoClick(itemId: number) {
    const itemsWithPhotos = request?.items.filter((i) => i.photoUrl) ?? [];
    if (itemsWithPhotos.length === 0) return;

    const index = itemsWithPhotos.findIndex((i) => i.id === itemId);
    if (index === -1) return;

    setPhotoItems(itemsWithPhotos);
    setCurrentPhotoIndex(index);
    setPhotoViewerOpen(true);
  }

  // ---- ローディング / エラー ----
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8faf9] px-6 py-8 md:px-12 md:py-10">
        <h1 className="mb-8 text-4xl font-extrabold text-slate-900 md:text-5xl">
          Request Details
        </h1>
        <p className="text-slate-500">Loading request...</p>
      </main>
    );
  }

  if (error || !request) {
    return (
      <main className="min-h-screen bg-[#f8faf9] px-6 py-8 md:px-12 md:py-10">
        <h1 className="mb-8 text-4xl font-extrabold text-slate-900 md:text-5xl">
          Request Details
        </h1>
        <p className="font-semibold text-red-600">
          {error || "Request not found"}
        </p>
      </main>
    );
  }

  // ---- 派生値 ----
  const customerName = `${request.customer.firstName} ${request.customer.lastName}`;
  const pickupDate = formatDate(request.preferredDatetime);
  const finalAmount =
    request.payment && request.payment.total
      ? `$${request.payment.total}`
      : "-";

  // ボタン制御ロジック
  const canEditQuotation =
    request.status === "RECEIVED" || request.status === "QUOTED";

  const canSendFinalAmount =
    request.status !== "PAID" && request.status !== "CANCELLED";

  // Items & Photos 表示件数制御
  const itemsToShow = showAllItems ? request.items : request.items.slice(0, 3);
  const hasMoreItems = request.items.length > 3;

  return (
    <main className="min-h-screen bg-[#f8faf9] px-6 py-8 md:px-12 md:py-10">
      {/* タイトル＋一覧に戻るボタン */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-4xl font-extrabold text-slate-900 md:text-5xl">
          Request Details
        </h1>

        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
        >
          Back to list
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 1. Customer */}
        <section className="rounded-3xl border border-slate-300 bg-white px-8 py-6">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">
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
        <section className="rounded-3xl border border-slate-300 bg-white px-8 py-6">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">
            Status Management
          </h2>

          <div className="mb-4 flex flex-wrap gap-3">
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
                    "rounded-full border px-6 py-2 text-sm font-semibold transition " +
                    (active
                      ? "bg-emerald-900 text-white border-emerald-900"
                      : "bg-white text-slate-900 border-slate-300 hover:bg-emerald-900 hover:text-white")
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>

          <p className="mt-6 text-base text-slate-900 md:text-lg">
            <span className="mr-2 font-semibold">Current Status:</span>
            <span className="inline-block px-3 py-1 font-extrabold">
              {formatStatusLabel(request.status)}
            </span>
          </p>
        </section>

        {/* 3. Booking */}
        <section className="rounded-3xl border border-slate-300 bg-white px-8 py-6">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">
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
              <h3 className="mb-1 font-semibold">Delivery</h3>
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
        <section className="rounded-3xl border border-slate-300 bg-white px-8 py-6">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">
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
            <p className="mb-4 text-sm text-slate-500">
              No quotation created yet.
            </p>
          )}

          <button
            type="button"
            disabled={!canEditQuotation}
            onClick={() => {
              if (!canEditQuotation) return;
              setShowQuotationModal(true);
            }}
            className={
              "w-full rounded-xl py-2 text-sm font-semibold transition " +
              (canEditQuotation
                ? "bg-emerald-900 text-white hover:bg-emerald-950"
                : "cursor-not-allowed bg-slate-100 text-slate-400")
            }
          >
            {request.quotation ? "Edit Quotation" : "Create Quotation"}
          </button>
        </section>

        {/* 5. Items & Photos */}
        <section className="rounded-3xl border border-slate-300 bg-white px-8 py-6">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">
            Items &amp; Photos
          </h2>

          {request.items.length === 0 && (
            <p className="text-slate-500">No items registered.</p>
          )}

          {request.items.length > 0 && (
            <>
              <ul className="space-y-4">
                {itemsToShow.map((item) => (
                  <li key={item.id} className="flex items-start gap-4">
                    {item.photoUrl && (
                      <button
                        type="button"
                        onClick={() => handlePhotoClick(item.id)}
                        className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200"
                      >
                        <img
                          src={item.photoUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    )}
                    <div>
                      <p className="font-semibold">
                        {item.name} - {item.size} (x{item.quantity})
                      </p>
                      {item.description && (
                        <p className="text-sm text-slate-600">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {hasMoreItems && (
                <div className="mt-4 text-right">
                  <button
                    type="button"
                    onClick={() => setShowAllItems((prev) => !prev)}
                    className="text-sm font-semibold text-emerald-900 hover:underline"
                  >
                    {showAllItems ? "Show less" : "Show all"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* 6. Final Billing */}
        <section className="rounded-3xl border border-slate-300 bg-white px-8 py-6">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">
            Final Billing
          </h2>
          <p className="mb-4">
            <span className="font-semibold">Final Amount: </span>
            {finalAmount}
          </p>
          <button
            type="button"
            disabled={!canSendFinalAmount}
            onClick={() => {
              if (!canSendFinalAmount) return;
              setShowFinalAmountModal(true);
            }}
            className={
              "w-full rounded-xl py-2 text-sm font-semibold transition " +
              (canSendFinalAmount
                ? "bg-emerald-900 text-white hover:bg-emerald-950"
                : "cursor-not-allowed bg-slate-100 text-slate-400")
            }
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
                className="flex-1 rounded-xl bg-emerald-900 py-3 text-sm font-semibold text-white transition hover:bg-emerald-950 disabled:opacity-60"
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
                className="flex-1 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 Photo Lightbox */}
      {photoViewerOpen && photoItems.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setPhotoViewerOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[80vh] rounded-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setPhotoViewerOpen(false)}
              className="absolute right-4 top-4 text-2xl text-white hover:text-slate-200"
              aria-label="Close"
            >
              ×
            </button>

            {/* Image */}
            <img
              src={photoItems[currentPhotoIndex].photoUrl ?? ""}
              alt={photoItems[currentPhotoIndex].name ?? "Item photo"}
              className="h-[80vh] w-full object-contain"
            />

            {/* Navigation */}
            {photoItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-lg text-white hover:bg-black/70"
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={goNextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-lg text-white hover:bg-black/70"
                  aria-label="Next photo"
                >
                  ›
                </button>
              </>
            )}
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
