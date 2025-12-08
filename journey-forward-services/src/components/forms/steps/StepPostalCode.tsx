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
    <div className="flex w-full flex-col">
      <div className="mb-6">
        <p className="text-lg font-bold text-[#22503B]">Step 1</p>
        <h2 className="mt-2 text-xl font-medium text-slate-900">
          Where are we Picking up?
        </h2>
      </div>

      <div className="w-full">
        <label className="mb-2 block text-sm font-medium text-slate-900">
          Postal Code <span className="text-red-500">*</span>
        </label>

        <Input
          placeholder="V6T 2J9"
          {...register("postalCode")}
          className="h-12 rounded-lg border-slate-300 text-base placeholder:text-slate-400 focus-visible:ring-[#2f7d4a]"
        />

        <div className="mt-2">
          {errors.postalCode ? (
            <p className="text-sm text-red-600">
              {errors.postalCode.message as string}
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Let&apos;s make sure you&apos;re in our pickup zone
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
