"use client";

import React, { useEffect, useState } from "react";

type Props = {
  requestId: number;
};

type BookingApiResponse = {
  data: {
    id: number;
    preferredDatetime: string;
    freeCancellationDeadline: string | null;
    status: string;
  };
};

type PreviewType = "FREE" | "PAID" | "NOT_ALLOWED" | null;

export default function CancelBookingButton({ requestId }: Props) {
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewType, setPreviewType] = useState<PreviewType>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 初回に予約情報を読んで、「無料/有料/不可」を判定
  useEffect(() => {
    let active = true;

    const loadBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${requestId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (!active) return;
          setErrorMessage(data.error ?? "Failed to load booking info.");
          setPreviewType("NOT_ALLOWED");
          return;
        }

        const json: BookingApiResponse = await res.json();
        const booking = json.data;

        const now = new Date();
        const pickup = new Date(booking.preferredDatetime);
        const freeDeadline = booking.freeCancellationDeadline
          ? new Date(booking.freeCancellationDeadline)
          : null;

        if (now >= pickup) {
          // 予約時間を過ぎている → キャンセル不可
          setPreviewType("NOT_ALLOWED");
        } else if (freeDeadline && now <= freeDeadline) {
          // 無料キャンセル期間内
          setPreviewType("FREE");
        } else {
          // 24時間を切っている → 有料キャンセル
          setPreviewType("PAID");
        }
      } catch (e) {
        if (!active) return;
        console.error("Failed to fetch booking for cancel preview:", e);
        setErrorMessage("Failed to load booking info.");
        setPreviewType("NOT_ALLOWED");
      } finally {
        if (active) setIsLoadingInitial(false);
      }
    };

    loadBooking();

    return () => {
      active = false;
    };
  }, [requestId]);

  const handleCancel = async () => {
    if (previewType === "NOT_ALLOWED") {
      return;
    }

    // 条件に応じて確認メッセージを出し分け
    let confirmMessage = "Are you sure you want to cancel this booking?";

    if (previewType === "PAID") {
      confirmMessage =
        "This cancellation will incur a $25 fee charged to your saved card. Do you want to proceed?";
    } else if (previewType === "FREE") {
      confirmMessage =
        "Are you sure you want to cancel? No cancellation fee will be charged.";
    }

    const ok = window.confirm(confirmMessage);
    if (!ok) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/bookings/${requestId}/cancel`, {
        method: "POST",
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        console.error("Cancel API error:", res.status, data);
        setErrorMessage(
          data.error ?? "Failed to cancel this booking. Please try again."
        );
        return;
      }

      // バックエンドの cancellationType を見てメッセージ出し分け
      if (data.cancellationType === "FREE") {
        alert("Your booking has been cancelled. No fee was charged.");
      } else if (data.cancellationType === "PAID") {
        alert(
          `Your booking has been cancelled. A cancellation fee of $${data.feeAmount} was charged.`
        );
      } else {
        alert("Your booking has been cancelled.");
      }

      // 成功後はボタンを無効状態に
      setPreviewType("NOT_ALLOWED");
    } catch (e) {
      console.error("Unexpected error while cancelling booking:", e);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const disabled =
    isLoadingInitial || isProcessing || previewType === "NOT_ALLOWED";

  let helperText: string | null = null;
  if (previewType === "FREE") {
    helperText = "Free cancellation is available for this booking.";
  } else if (previewType === "PAID") {
    helperText =
      "Cancelling now will incur a $25 cancellation fee charged to your saved card.";
  } else if (previewType === "NOT_ALLOWED") {
    helperText = "Cancellation is no longer available after the pickup time.";
  }

  return (
    <div className="mt-8 flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleCancel}
        disabled={disabled}
        className={`inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold border
          ${
            disabled
              ? "border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100"
              : "border-red-500 text-red-600 hover:bg-red-50"
          }`}
      >
        {isProcessing ? "Processing cancellation..." : "Cancel this booking"}
      </button>

      {helperText && (
        <p className="text-xs text-gray-500 text-right max-w-xs">
          {helperText}
        </p>
      )}

      {errorMessage && (
        <p className="text-xs text-red-600 text-right max-w-xs">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
