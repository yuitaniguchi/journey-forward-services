"use client";

import { useFormContext } from "react-hook-form";
import { Item } from "../ItemList";

type Props = {
  items: Item[];
  setStep: (step: number) => void;
};

export default function StepConfirmation({ items, setStep }: Props) {
  const { watch, getValues } = useFormContext();

  const pickupDateTime = watch("pickupDateTime");
  const deliveryRequired = watch("deliveryRequired");

  const addressValue = watch("address");
  const deliveryAddressValue = watch("deliveryAddress");

  const pickupDateStr = pickupDateTime
    ? new Date(pickupDateTime).toLocaleString()
    : "-";

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-[#22503B]">Confirmation</h2>

      {/* Pickup Info */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#22503B]">Pickup Info</h3>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="rounded border border-[#3F7253] px-3 py-1 text-xs font-medium text-[#3F7253] hover:bg-[#e7f0eb]"
          >
            Edit
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-[#f9fafb] px-6 py-4 text-sm text-slate-700">
          <div className="grid gap-y-2 gap-x-8 md:grid-cols-[120px,1fr]">
            <span className="font-medium">Pickup Date</span>
            <span>{pickupDateStr}</span>

            <span className="font-medium">Pickup Address</span>
            <span>
              {addressValue?.street}
              {addressValue?.line2 ? `, ${addressValue.line2}` : ""}
              <br />
              {addressValue?.city}, {addressValue?.province}
              {getValues("postalCode") ? `, ${getValues("postalCode")}` : ""}
            </span>

            <span className="font-medium">Other</span>
            <span>
              {watch("floor") || "-"} floor /{" "}
              {watch("hasElevator") ? "Elevator" : "No elevator"}
            </span>
          </div>
        </div>
      </section>

      {/* Delivery Info */}
      {deliveryRequired && deliveryAddressValue && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#22503B]">Delivery Info</h3>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded border border-[#3F7253] px-3 py-1 text-xs font-medium text-[#3F7253] hover:bg-[#e7f0eb]"
            >
              Edit
            </button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-[#f9fafb] px-6 py-4 text-sm text-slate-700">
            <div className="grid gap-y-2 gap-x-8 md:grid-cols-[120px,1fr]">
              <span className="font-medium">Address</span>
              <span>
                {deliveryAddressValue.street}
                {deliveryAddressValue.line2
                  ? `, ${deliveryAddressValue.line2}`
                  : ""}
                <br />
                {deliveryAddressValue.city}, {deliveryAddressValue.province}
              </span>
              <span className="font-medium">Other</span>
              <span>
                {watch("deliveryFloor") || "-"} floor /{" "}
                {watch("deliveryElevator") ? "Elevator" : "No elevator"}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Item Info */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#22503B]">Item Info</h3>
          <button
            type="button"
            onClick={() => setStep(3)}
            className="rounded border border-[#3F7253] px-3 py-1 text-xs font-medium text-[#3F7253] hover:bg-[#e7f0eb]"
          >
            Edit
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-[#f9fafb] px-6 py-4 text-sm text-slate-700">
          <div className="grid gap-y-2 gap-x-8 md:grid-cols-[120px,1fr]">
            <span className="font-medium">Item Info</span>
            <span>
              {items.length === 0 ? (
                "-"
              ) : (
                <div className="space-y-1">
                  {items.map((it) => (
                    <div key={it.id}>
                      {it.name} [{it.size}]
                      {it.quantity > 1 ? ` x${it.quantity}` : ""}
                      {it.description && (
                        <span className="ml-2 text-xs text-slate-500">
                          ({it.description})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </span>
          </div>
        </div>
      </section>

      {/* User Info */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#22503B]">Your Info</h3>
          <button
            type="button"
            onClick={() => setStep(4)}
            className="rounded border border-[#3F7253] px-3 py-1 text-xs font-medium text-[#3F7253] hover:bg-[#e7f0eb]"
          >
            Edit
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-[#f9fafb] px-6 py-4 text-sm text-slate-700">
          <div className="grid gap-y-2 gap-x-8 md:grid-cols-[120px,1fr]">
            <span className="font-medium">Name</span>
            <span>
              {watch("firstName")} {watch("lastName")}
            </span>

            <span className="font-medium">Email</span>
            <span>{watch("email")}</span>

            <span className="font-medium">Phone Number</span>
            <span>{watch("phone")}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
