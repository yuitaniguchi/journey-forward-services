"use client";

import { useFormContext } from "react-hook-form";
import { Check } from "lucide-react"; // アイコン用にインポート
import DateTimePicker from "../DateTimePicker";

export default function StepDateTime() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const deliveryRequired = watch("deliveryRequired");
  const pickupDateTime = watch("pickupDateTime");

  return (
    <div className="flex w-full flex-col">
      {/* ヘッダー部分 */}
      <div className="mb-6">
        <p className="text-lg font-bold text-[#22503B]">Step 2</p>
        <h2 className="mt-2 text-xl font-medium text-slate-900">
          When are we Picking up?
        </h2>
      </div>

      {/* 日付入力部分 */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-slate-900">
          Pickup Date <span className="text-red-500">*</span>
        </label>
        <DateTimePicker
          value={pickupDateTime ?? ""}
          onChange={(v) =>
            setValue("pickupDateTime", v, { shouldValidate: true })
          }
          error={errors.pickupDateTime?.message as string}
        />
      </div>

      {/* カスタムチェックボックス部分 */}
      <div
        className="flex cursor-pointer items-center gap-3"
        onClick={() => setValue("deliveryRequired", !deliveryRequired)}
      >
        {/* 丸いチェックボックスのデザイン */}
        <div
          className={
            "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors " +
            (deliveryRequired
              ? "border-[#22503B] bg-[#22503B]" // ONの時
              : "border-[#22503B] bg-transparent") // OFFの時
          }
        >
          {deliveryRequired && <Check className="h-4 w-4 text-white" />}
        </div>

        {/* テキスト */}
        <span className="text-[#22503B] font-medium">Need Delivery?</span>

        {/* React Hook Form用の隠しinput (機能維持のため) */}
        <input
          type="checkbox"
          className="hidden"
          checked={deliveryRequired || false}
          readOnly
        />
      </div>
    </div>
  );
}
