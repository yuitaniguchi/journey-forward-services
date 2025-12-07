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
    <div className="mt-4 space-y-2">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Street Address */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            Street Address
          </label>
          <Input placeholder="123 Main St" {...register(`${prefix}.street`)} />
          {getError("street") && (
            <p className="text-sm text-red-600">{getError("street")}</p>
          )}
        </div>

        {/* Address Line 2 */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            Address Line 2 (Optional)
          </label>
          <Input
            placeholder="Apt, Suite, Unit, etc."
            {...register(`${prefix}.line2`)}
          />
        </div>

        {/* City (Dropdown) */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">City</label>
          <select
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register(`${prefix}.city`)}
            defaultValue=""
          >
            <option value="" disabled>
              Select a city
            </option>
            {ALLOWED_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {getError("city") && (
            <p className="text-sm text-red-600">{getError("city")}</p>
          )}
        </div>

        {/* Province / State */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Province</label>
          <Input
            placeholder="BC"
            defaultValue="BC"
            readOnly
            className="bg-slate-100 text-slate-500"
            {...register(`${prefix}.province`)}
          />
          {getError("province") && (
            <p className="text-sm text-red-600">{getError("province")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
