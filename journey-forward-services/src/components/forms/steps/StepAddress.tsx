"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import AddressInput from "../AddressInput";
import { Input } from "@/components/ui/input";

export default function StepAddress() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  // フォームの値監視
  const deliveryRequired = watch("deliveryRequired");
  const hasElevator = watch("hasElevator");
  const deliveryElevator = watch("deliveryElevator");

  // カスタムラジオボタンコンポーネント（Pickup/Delivery両方で使うため共通化）
  const renderRadioGroup = (
    fieldName: string,
    currentValue: boolean | undefined | null
  ) => (
    <div className="flex items-center gap-6 h-12">
      {/* Yes */}
      <label className="flex cursor-pointer items-center gap-2">
        <div className="relative flex items-center">
          <input
            type="radio"
            value="true"
            checked={currentValue === true}
            onChange={() => setValue(fieldName, true, { shouldValidate: true })}
            className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-[#22503B] checked:border-[#22503B]"
          />
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-[#22503B] w-2.5 h-2.5 transition-transform peer-checked:scale-100" />
        </div>
        <span className="text-slate-700">Yes</span>
      </label>

      {/* No */}
      <label className="flex cursor-pointer items-center gap-2">
        <div className="relative flex items-center">
          <input
            type="radio"
            value="false"
            checked={currentValue === false}
            onChange={() =>
              setValue(fieldName, false, { shouldValidate: true })
            }
            className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border-2 border-slate-300 checked:border-[#22503B]"
          />
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-[#22503B] w-2.5 h-2.5 transition-transform peer-checked:scale-100" />
        </div>
        <span className="text-slate-700">No</span>
      </label>
    </div>
  );

  return (
    <div className="flex w-full flex-col">
      {/* ヘッダー部分 */}
      <div className="mb-6">
        <p className="text-lg font-bold text-[#22503B]">Step 3</p>
      </div>

      {/* ================= Pickup Section ================= */}
      <div className="mb-8">
        <label className="mb-3 block text-sm font-medium text-slate-900">
          Pickup Address <span className="text-red-500">*</span>
        </label>
        <AddressInput prefix="address" />
      </div>

      {/* Pickup Floor & Elevator */}
      <div className="grid gap-8 md:grid-cols-2 mb-8">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-900">
            Which floor is it? <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Floor"
            className="h-12 rounded-lg border-slate-300 placeholder:text-slate-400 focus-visible:ring-[#2f7d4a]"
            {...register("floor")}
          />
          {errors.floor && (
            <p className="text-sm text-red-600">
              {errors.floor.message as string}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-900">
            Is there an elevator? <span className="text-red-500">*</span>
          </label>
          {renderRadioGroup("hasElevator", hasElevator)}
          {errors.hasElevator && (
            <p className="text-sm text-red-600">Please select one</p>
          )}
        </div>
      </div>

      {/* ================= Delivery Section (条件付き表示) ================= */}
      {deliveryRequired && (
        <div className="border-t border-slate-200 pt-8 animate-in fade-in slide-in-from-top-2">
          <div className="mb-8">
            <label className="mb-3 block text-sm font-medium text-slate-900">
              Delivery Address <span className="text-red-500">*</span>
            </label>
            <AddressInput prefix="deliveryAddress" />
          </div>

          {/* Delivery Floor & Elevator */}
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-900">
                Which floor is it? <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Floor"
                className="h-12 rounded-lg border-slate-300 placeholder:text-slate-400 focus-visible:ring-[#2f7d4a]"
                {...register("deliveryFloor")}
              />
              {errors.deliveryFloor && (
                <p className="text-sm text-red-600">
                  {errors.deliveryFloor.message as string}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-900">
                Is there an elevator? <span className="text-red-500">*</span>
              </label>
              {renderRadioGroup("deliveryElevator", deliveryElevator)}
              {/* バリデーションエラーが必要ならここにも追加 */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
