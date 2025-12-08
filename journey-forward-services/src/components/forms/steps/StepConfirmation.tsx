"use client";

import { useFormContext } from "react-hook-form";
import { Item } from "../ItemList";

type Props = {
  items: Item[];
  setStep: (step: number) => void;
};

export default function StepConfirmation({ items, setStep }: Props) {
  const { watch } = useFormContext();

  // フォームの値を取得
  const pickupDateTime = watch("pickupDateTime");
  const deliveryRequired = watch("deliveryRequired");
  const address = watch("address");
  const deliveryAddress = watch("deliveryAddress");
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const email = watch("email");
  const phone = watch("phone");
  const postalCode = watch("postalCode");

  // 日付フォーマット関数 (画像に合わせて調整: Aug 14, 2025 - 9:00 AM)
  const getFormattedDate = (val: string) => {
    if (!val) return "-";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "-";

    const datePart = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timePart = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${datePart} - ${timePart}`;
  };

  const pickupDateStr = getFormattedDate(pickupDateTime);

  // 行コンポーネント (ラベル左、値右のレイアウト)
  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="flex justify-between items-start gap-4">
      <span className="font-medium text-slate-900 shrink-0">{label}</span>
      <span className="text-slate-700 text-right">{value}</span>
    </div>
  );

  return (
    <div className="flex w-full flex-col space-y-8">
      {/* メインタイトル */}
      <h2 className="text-xl font-bold text-[#22503B]">Confirmation</h2>

      {/* ================= Pickup Info ================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#22503B]">Pickup Info</h3>
          <button
            type="button"
            onClick={() => setStep(1)} // Date selection step
            className="rounded border border-[#3F7253] px-4 py-1 text-xs font-semibold text-[#3F7253] hover:bg-[#e7f0eb] transition-colors"
          >
            Edit
          </button>
        </div>

        <div className="rounded bg-[#F9FAFB] p-6 text-sm">
          <div className="flex flex-col gap-4">
            <InfoRow label="Date" value={pickupDateStr} />
            <InfoRow
              label="Address"
              value={
                <>
                  {address?.street}
                  {address?.line2 ? `, ${address.line2}` : ""}
                  <br />
                  {address?.city}, {address?.province}, {postalCode}
                </>
              }
            />
            <InfoRow
              label="Other"
              value={`${watch("floor") || "-"} floor/${
                watch("hasElevator") ? "Elevator available" : "No elevator"
              }`}
            />
          </div>
        </div>
      </div>

      {/* ================= Delivery Info (Conditional) ================= */}
      {deliveryRequired && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#22503B]">Delivery Info</h3>
            <button
              type="button"
              onClick={() => setStep(2)} // Address step
              className="rounded border border-[#3F7253] px-4 py-1 text-xs font-semibold text-[#3F7253] hover:bg-[#e7f0eb] transition-colors"
            >
              Edit
            </button>
          </div>

          <div className="rounded bg-[#F9FAFB] p-6 text-sm">
            <div className="flex flex-col gap-4">
              <InfoRow
                label="Address"
                value={
                  <>
                    {deliveryAddress?.street}
                    {deliveryAddress?.line2 ? `, ${deliveryAddress.line2}` : ""}
                    <br />
                    {deliveryAddress?.city}, {deliveryAddress?.province}
                  </>
                }
              />
              <InfoRow
                label="Other"
                value={`${watch("deliveryFloor") || "-"} floor/${
                  watch("deliveryElevator")
                    ? "Elevator available"
                    : "No elevator"
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= Item Info ================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#22503B]">Item Info</h3>
          <button
            type="button"
            onClick={() => setStep(3)} // Items step
            className="rounded border border-[#3F7253] px-4 py-1 text-xs font-semibold text-[#3F7253] hover:bg-[#e7f0eb] transition-colors"
          >
            Edit
          </button>
        </div>

        <div className="rounded bg-[#F9FAFB] p-6 text-sm">
          <div className="flex flex-col gap-4">
            <InfoRow
              label="Item Info"
              value={
                items.length > 0 ? (
                  <div className="flex flex-col items-end gap-1">
                    {items.map((it, idx) => (
                      <span key={idx}>
                        {it.name} [{it.size}]
                        {it.quantity > 1 && ` x${it.quantity}`}
                      </span>
                    ))}
                  </div>
                ) : (
                  "No items added"
                )
              }
            />
          </div>
        </div>
      </div>

      {/* ================= Your Info ================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#22503B]">Your Info</h3>
          <button
            type="button"
            onClick={() => setStep(4)} // User Info step
            className="rounded border border-[#3F7253] px-4 py-1 text-xs font-semibold text-[#3F7253] hover:bg-[#e7f0eb] transition-colors"
          >
            Edit
          </button>
        </div>

        <div className="rounded bg-[#F9FAFB] p-6 text-sm">
          <div className="flex flex-col gap-4">
            <InfoRow label="Name" value={`${firstName} ${lastName}`} />
            <InfoRow label="Email" value={email} />
            <InfoRow label="Phone Number" value={phone} />
            {/* 画像に合わせて住所も表示 (Pickup Addressと同じものを表示) */}
            <InfoRow
              label="Address"
              value={
                <>
                  {address?.street}
                  {address?.line2 ? `, ${address.line2}` : ""}, {address?.city},{" "}
                  {address?.province}, {postalCode}
                </>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
