"use client";

import React, { useState } from "react";
import Select from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import AddressInput from "../../components/forms/AddressInput";
import DateTimePicker from "../../components/forms/DateTimePicker";
import ItemList from "../../components/forms/ItemList";

export default function BookingForm() {
  const [form, setForm] = useState({
    serviceType: "",
    address: "",
    hasElevator: false,
    upperFloor: false,
    dateTime: "",
    items: [],
  });

  const [errors, setErrors] = useState({
    serviceType: "",
    address: "",
    dateTime: "",
  });

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!form.serviceType)
      newErrors.serviceType = "Please select a service type.";
    if (!form.address.trim()) newErrors.address = "Address is required.";
    if (!form.dateTime)
      newErrors.dateTime = "Please select a valid date & time.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Booking data:", form);
      alert("Booking submitted!");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-5 border border-[#BFEEEE]"
    >
      <h2 className="text-2xl font-semibold text-[#22503B] mb-4">
        Create Booking
      </h2>

      <Select
        label="Service Type"
        options={[
          { value: "moving", label: "Moving Service" },
          { value: "cleaning", label: "Cleaning Service" },
          { value: "delivery", label: "Delivery Service" },
        ]}
        value={form.serviceType}
        onChange={(val) => handleChange("serviceType", val)}
        error={errors.serviceType}
      />

      <AddressInput
        value={form.address}
        onChange={(v) => handleChange("address", v)}
        error={errors.address}
      />

      <DateTimePicker
        value={form.dateTime}
        onChange={(v) => handleChange("dateTime", v)}
        error={errors.dateTime}
      />

      <div className="flex items-center gap-6 mt-4">
        <label className="flex items-center gap-2 text-[#22503B]">
          <input
            type="checkbox"
            checked={form.upperFloor}
            onChange={(e) => handleChange("upperFloor", e.target.checked)}
            className="accent-[#367D5E]"
          />
          Upper Floor
        </label>

        <label className="flex items-center gap-2 text-[#22503B]">
          <input
            type="checkbox"
            checked={form.hasElevator}
            onChange={(e) => handleChange("hasElevator", e.target.checked)}
            className="accent-[#367D5E]"
          />
          Elevator Available
        </label>
      </div>

      <ItemList
        items={form.items}
        onChange={(list) => handleChange("items", list)}
      />

      <div className="pt-4">
        <Button type="submit">Submit Booking</Button>
      </div>
    </form>
  );
}
