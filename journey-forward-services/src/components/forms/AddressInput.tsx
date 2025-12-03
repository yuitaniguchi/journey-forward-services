"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";

export const ALLOWED_CITIES = ["Vancouver", "Burnaby", "Richmond", "Surrey"];

export default function AddressInput() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const addressErrors = (errors.address as any) || {};

  return (
    <div className="mt-4 space-y-2">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Street Address */}
        <div className="space-y-1">
          <Input
            placeholder="Street Address"
            {...register("address.street")} // Zodの address: { street: ... } に対応
          />
          {addressErrors.street && (
            <p className="text-sm text-red-600">
              {addressErrors.street.message}
            </p>
          )}
        </div>

        {/* Address Line 2 */}
        <div className="space-y-1">
          <Input
            placeholder="Address Line 2 (Optional)"
            {...register("address.line2")}
          />
        </div>

        {/* City */}
        <div className="space-y-1">
          <Input
            placeholder="City (e.g. Vancouver)"
            {...register("address.city")}
          />
          {addressErrors.city && (
            <p className="text-sm text-red-600">{addressErrors.city.message}</p>
          )}
        </div>

        {/* Province / State */}
        <div className="space-y-1">
          <Input
            placeholder="State / Province"
            defaultValue="BC"
            {...register("address.province")}
          />
          {addressErrors.province && (
            <p className="text-sm text-red-600">
              {addressErrors.province.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
