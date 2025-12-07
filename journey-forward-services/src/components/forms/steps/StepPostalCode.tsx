"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";

type Props = {
  outOfArea: boolean;
};

export default function StepPostalCode({ outOfArea }: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  if (outOfArea) {
    return (
      <div className="flex justify-center py-8">
        <div className="max-w-xl space-y-4 text-left">
          <p className="text-lg font-semibold text-[#22503B]">
            We&apos;re sorry...
          </p>
          <p className="text-sm leading-relaxed text-slate-700">
            It looks like we haven&apos;t reached your area yet.
            <br />
            We&apos;re working hard to expand our service and hope to help you
            say goodbye to your junk soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="font-semibold text-[#22503B]">Step 1</p>
      <h2 className="text-xl font-semibold text-[#22503B]">
        Where are we Picking up?
      </h2>
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-800">
          Postal Code <span className="text-red-500">*</span>
        </label>
        <Input placeholder="V6T 2J9" {...register("postalCode")} />
        {errors.postalCode && (
          <p className="text-sm text-red-600">
            {errors.postalCode.message as string}
          </p>
        )}
        <p className="text-xs text-slate-500">
          Let&apos;s make sure you&apos;re in our pickup zone.
        </p>
      </div>
    </div>
  );
}
