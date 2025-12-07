"use client";

import { useFormContext } from "react-hook-form";
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
    <div className="space-y-6">
      <p className="font-semibold text-[#22503B]">Step 2</p>
      <h2 className="text-xl font-semibold text-[#22503B]">
        When are we Picking up?
      </h2>

      <DateTimePicker
        value={pickupDateTime ?? ""}
        onChange={(v) =>
          setValue("pickupDateTime", v, { shouldValidate: true })
        }
        error={errors.pickupDateTime?.message as string}
      />

      <div className="mt-4 flex items-center gap-3 text-sm text-[#22503B]">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-[#2f7d4a]"
            checked={deliveryRequired}
            onChange={(e) => setValue("deliveryRequired", e.target.checked)}
          />
          Need Delivery?
        </label>
      </div>
    </div>
  );
}
