"use client";

import React, { useState } from "react";
import { Input } from "../../components/ui/input";

interface AddressInputProps {
  /** Current address value */
  value: string;
  /** Callback when the address changes */
  onChange: (value: string) => void;
  /** Optional label */
  label?: string;
  /** External error message */
  error?: string;
}

const allowedCities = ["Vancouver", "Burnaby", "Richmond", "Surrey"];

export default function AddressInput({
  value,
  onChange,
  label = "Address",
  error,
}: AddressInputProps) {
  const [cityError, setCityError] = useState("");

  const handleBlur = () => {
    const city = value.split(",").pop()?.trim() || "";

    if (city && !allowedCities.includes(city)) {
      setCityError(
        "Service is only available in: Vancouver, Burnaby, Richmond, Surrey."
      );
    } else {
      setCityError("");
    }
  };

  const mergedError = error || cityError;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-1 text-slate-900">
        {label}
      </label>

      <Input
        placeholder="123 Main St, Vancouver"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        className={
          mergedError ? "border-red-500 focus-visible:ring-red-500" : undefined
        }
      />

      {mergedError && (
        <p className="text-sm text-red-600 mt-1">{mergedError}</p>
      )}

      <p className="text-sm text-[#22503B] mt-1">
        <strong>Tip:</strong> Format should be “Street, City”
      </p>
    </div>
  );
}
