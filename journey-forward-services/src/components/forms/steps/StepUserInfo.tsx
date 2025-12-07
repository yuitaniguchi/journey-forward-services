"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";

export default function StepUserInfo() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <p className="font-semibold text-[#22503B]">Step 5</p>
      <h2 className="text-xl font-semibold text-[#22503B]">Your Details</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-800">
            First Name <span className="text-red-500">*</span>
          </label>
          <Input placeholder="First Name" {...register("firstName")} />
          {errors.firstName && (
            <p className="text-sm text-red-600">
              {errors.firstName.message as string}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-800">
            Last Name <span className="text-red-500">*</span>
          </label>
          <Input placeholder="Last Name" {...register("lastName")} />
          {errors.lastName && (
            <p className="text-sm text-red-600">
              {errors.lastName.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-800">
            Email <span className="text-red-500">*</span>
          </label>
          <Input placeholder="Email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-red-600">
              {errors.email.message as string}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-800">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <Input placeholder="e.g. 604-123-4567" {...register("phone")} />
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
