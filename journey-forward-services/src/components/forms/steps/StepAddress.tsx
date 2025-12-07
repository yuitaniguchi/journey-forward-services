"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import AddressInput from "../AddressInput";

export default function StepAddress() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const deliveryRequired = watch("deliveryRequired");

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="border-b pb-2">
          <p className="font-semibold text-[#22503B]">Step 3</p>
          <h2 className="text-xl font-semibold text-[#22503B]">
            Pickup Address
          </h2>
        </div>

        <AddressInput prefix="address" />

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800">
              Floor <span className="text-red-500">*</span>
            </label>
            <Input placeholder="e.g. 2, B1" {...register("floor")} />
            {errors.floor && (
              <p className="text-sm text-red-600">
                {errors.floor.message as string}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800">
              Elevator?
            </label>
            <div className="flex items-center gap-4 text-sm text-[#22503B]">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  className="accent-[#2f7d4a]"
                  checked={watch("hasElevator") === true}
                  onChange={() => setValue("hasElevator", true)}
                />{" "}
                Yes
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  className="accent-[#2f7d4a]"
                  checked={watch("hasElevator") === false}
                  onChange={() => setValue("hasElevator", false)}
                />{" "}
                No
              </label>
            </div>
          </div>
        </div>
      </div>

      {deliveryRequired && (
        <div className="space-y-4 border-t border-slate-200 pt-4">
          <h2 className="text-xl font-semibold text-[#22503B]">
            Delivery Address
          </h2>

          <AddressInput prefix="deliveryAddress" />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800">
                Floor <span className="text-red-500">*</span>
              </label>
              <Input placeholder="e.g. 2" {...register("deliveryFloor")} />
              {errors.deliveryFloor && (
                <p className="text-sm text-red-600">
                  {errors.deliveryFloor.message as string}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800">
                Elevator?
              </label>
              <div className="flex items-center gap-4 text-sm text-[#22503B]">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    className="accent-[#2f7d4a]"
                    checked={watch("deliveryElevator") === true}
                    onChange={() => setValue("deliveryElevator", true)}
                  />{" "}
                  Yes
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    className="accent-[#2f7d4a]"
                    checked={watch("deliveryElevator") === false}
                    onChange={() => setValue("deliveryElevator", false)}
                  />{" "}
                  No
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
