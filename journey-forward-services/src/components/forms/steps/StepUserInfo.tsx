"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";

export default function StepUserInfo() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="flex w-full flex-col">
      {/* ヘッダー部分 */}
      <div className="mb-6">
        <p className="text-lg font-bold text-[#22503B]">Step 5</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">Your Details</h2>
      </div>

      {/* 名前入力エリア (2列) */}
      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="mb-1 block text-sm font-medium text-slate-900">
            First Name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="First Name"
            className="h-12 rounded-lg border-slate-300 placeholder:text-slate-400 focus-visible:ring-[#2f7d4a]"
            {...register("firstName")}
          />
          {errors.firstName && (
            <p className="text-sm text-red-600">
              {errors.firstName.message as string}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="mb-1 block text-sm font-medium text-slate-900">
            Last Name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Last Name"
            className="h-12 rounded-lg border-slate-300 placeholder:text-slate-400 focus-visible:ring-[#2f7d4a]"
            {...register("lastName")}
          />
          {errors.lastName && (
            <p className="text-sm text-red-600">
              {errors.lastName.message as string}
            </p>
          )}
        </div>
      </div>

      {/* 連絡先入力エリア (2列) */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="mb-1 block text-sm font-medium text-slate-900">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Email"
            className="h-12 rounded-lg border-slate-300 placeholder:text-slate-400 focus-visible:ring-[#2f7d4a]"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-600">
              {errors.email.message as string}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="mb-1 block text-sm font-medium text-slate-900">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Phone Number"
            className="h-12 rounded-lg border-slate-300 placeholder:text-slate-400 focus-visible:ring-[#2f7d4a]"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-sm text-red-600">
              {errors.phone.message as string}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
