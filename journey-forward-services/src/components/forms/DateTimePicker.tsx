"use client";

import React, { useState } from "react";
import { Input } from "../../components/ui/input";

interface DateTimePickerProps {
  /** Current selected datetime (ISO string) */
  value: string;
  /** Callback when datetime changes */
  onChange: (value: string) => void;
  /** Optional label */
  label?: string;
  /** External error message */
  error?: string;
}

export default function DateTimePicker({
  value,
  onChange,
  label = "Date & Time",
  error,
}: DateTimePickerProps) {
  const [localError, setLocalError] = useState("");

  const validateDate = (val: string) => {
    if (!val) {
      setLocalError("Please select a date and time.");
      return;
    }

    const selected = new Date(val);
    const now = new Date();
    const minAllowed = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 hours

    if (selected < minAllowed) {
      setLocalError("Date & time must be at least 24 hours from now.");
    } else {
      setLocalError("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    onChange(newVal);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <Input
        type="datetime-local"
        value={value}
        onChange={handleChange}
        onBlur={() => validateDate(value)}
      />
      {(error || localError) && (
        <p className="mt-1 text-sm text-red-600">{error || localError}</p>
      )}
    </div>
  );
}
