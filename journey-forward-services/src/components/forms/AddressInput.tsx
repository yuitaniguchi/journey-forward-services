"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";

export const ALLOWED_CITIES = ["Vancouver", "Burnaby", "Richmond", "Surrey"];

type Props = {
  prefix?: string;
};

export default function AddressInput({ prefix = "address" }: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const getError = (field: string) => {
    const errorObj = (errors as any)[prefix];
    return errorObj?.[field]?.message;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Street Address */}
      <div className="space-y-1">
        <Input
          placeholder="Street Address"
          autoComplete={`section-${prefix} address-line1`}
          className="h-12 rounded-lg border-slate-300 placeholder:text-slate-400 focus-visible:ring-[#2f7d4a]"
          {...register(`${prefix}.street`)}
        />
        {getError("street") && (
          <p className="text-sm text-red-600">{getError("street")}</p>
        )}
      </div>

      {/* Address Line 2 */}
      <div className="space-y-1">
        <Input
          placeholder="Address Line 2"
          autoComplete={`section-${prefix} address-line2`}
          className="h-12 rounded-lg border-slate-300 placeholder:text-slate-400 focus-visible:ring-[#2f7d4a]"
          {...register(`${prefix}.line2`)}
        />
      </div>

      {/* City (Dropdown) */}
      <div className="space-y-1">
        <div className="relative">
          <select
            className="flex h-12 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f7d4a] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register(`${prefix}.city`)}
            autoComplete={`section-${prefix} address-level2`}
            defaultValue=""
          >
            <option value="" disabled className="text-slate-400">
              City
            </option>
            {ALLOWED_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        {getError("city") && (
          <p className="text-sm text-red-600">{getError("city")}</p>
        )}
      </div>

      {/* Province / State */}
      <div className="space-y-1">
        <Input
          placeholder="British Columbia"
          defaultValue="British Columbia"
          readOnly
          autoComplete={`section-${prefix} address-level1`}
          className="h-12 rounded-lg border-slate-300 bg-white text-slate-900 focus-visible:ring-[#2f7d4a]"
          {...register(`${prefix}.province`)}
        />
        {getError("province") && (
          <p className="text-sm text-red-600">{getError("province")}</p>
        )}
      </div>
    </div>
  );
}
