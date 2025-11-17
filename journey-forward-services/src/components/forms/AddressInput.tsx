"use client";

import React, { useState } from "react";
import Input from "../../components/ui/input";

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

  return (
    <div className="w-full">
      <Input
        label={label}
        placeholder="123 Main St, Vancouver"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        error={error || cityError}
      />

      <p className="text-sm text-[#22503B] mt-1">
        <strong>Tip:</strong> Format should be “Street, City”
      </p>
    </div>
  );
}