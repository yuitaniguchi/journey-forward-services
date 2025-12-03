"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import AddressInput from "./AddressInput";
import DateTimePicker from "./DateTimePicker";
import ItemList, { Item } from "./ItemList";

const pickupDateTimeSchema = z
  .string()
  .min(1, "Pickup date & time is required")
  .refine((value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return false;
    const diff = d.getTime() - Date.now();
    return diff >= 24 * 60 * 60 * 1000;
  }, "Pickup time must be at least 24 hours from now");

const bookingSchema = z.object({
  postalCode: z.string().min(1, "Postal code is required"),
  pickupDateTime: pickupDateTimeSchema,
  deliveryRequired: z.boolean(),

  address: z.object({
    street: z.string().min(1, "Street address is required"),
    line2: z.string().optional(),
    city: z
      .string()
      .min(1, "City is required")
      .refine(
        (val) =>
          ["Vancouver", "Burnaby", "Richmond", "Surrey"].some(
            (c) => c.toLowerCase() === val.toLowerCase()
          ),
        "Service is only available in: Vancouver, Burnaby, Richmond, Surrey"
      ),
    province: z.string(),
  }),

  floor: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9]+$/.test(val), "Floor must be a number"),
  hasElevator: z.boolean(),

  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
});

const VANCOUVER_PREFIXES = [
  "V5K",
  "V5L",
  "V5M",
  "V5N",
  "V5P",
  "V5R",
  "V5S",
  "V5T",
  "V5V",
  "V5W",
  "V5X",
  "V5Y",
  "V5Z",
  "V6A",
  "V6B",
  "V6C",
  "V6E",
  "V6G",
  "V6H",
  "V6J",
  "V6K",
  "V6L",
  "V6M",
  "V6N",
  "V6P",
  "V6R",
  "V6S",
  "V6T",
  "V6Z",
  "V7X",
  "V7Y",
];

const BURNABY_PREFIXES = [
  "V3J",
  "V3N",
  "V5A",
  "V5B",
  "V5C",
  "V5E",
  "V5G",
  "V5H",
  "V5J",
];

const RICHMOND_PREFIXES = [
  "V6V",
  "V6W",
  "V6X",
  "V6Y",
  "V7A",
  "V7B",
  "V7C",
  "V7E",
];

const SURREY_PREFIXES = [
  "V3R",
  "V3S",
  "V3T",
  "V3V",
  "V3W",
  "V3X",
  "V3Z",
  "V4A",
  "V4N",
  "V4P",
];

const SUPPORTED_POSTAL_PREFIXES = [
  ...VANCOUVER_PREFIXES,
  ...BURNABY_PREFIXES,
  ...RICHMOND_PREFIXES,
  ...SURREY_PREFIXES,
];

function isSupportedPostalCode(postalRaw: string) {
  const code = postalRaw.replace(/\s+/g, "").toUpperCase();
  const fsa = code.slice(0, 3);
  return SUPPORTED_POSTAL_PREFIXES.includes(fsa);
}

export type BookingFormValues = z.infer<typeof bookingSchema>;

const STEPS = [
  "Postal Code",
  "Date",
  "Address",
  "Size of Items",
  "Your info",
  "Confirmation",
] as const;

export default function BookingForm() {
  const methods = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    mode: "onTouched",
    defaultValues: {
      postalCode: "",
      pickupDateTime: "",
      deliveryRequired: false,
      address: {
        street: "",
        line2: "",
        city: "",
        province: "BC",
      },
      floor: "",
      hasElevator: false,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = methods;

  const [step, setStep] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [itemsError, setItemsError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequestNumber, setSubmittedRequestNumber] = useState<
    string | null
  >(null);
  const [outOfArea, setOutOfArea] = useState(false);

  const deliveryRequired = watch("deliveryRequired");
  const addressValue = watch("address");
  const pickupDateTime = watch("pickupDateTime");

  const stepFields: (
    | keyof BookingFormValues
    | `address.${keyof BookingFormValues["address"]}`
  )[][] = [
    ["postalCode"],
    ["pickupDateTime"],
    ["address.street", "address.city", "address.province", "floor"],
    [],
    ["firstName", "lastName", "email", "phone"],
    [],
  ];

  const handleNext = async () => {
    const fields = stepFields[step] as any;
    if (fields.length > 0) {
      const ok = await trigger(fields);
      if (!ok) return;
    }

    if (step === 0) {
      const postal = getValues("postalCode")?.trim() ?? "";
      if (!isSupportedPostalCode(postal)) {
        setOutOfArea(true);
        return;
      } else {
        setOutOfArea(false);
      }
    }

    if (step === 3) {
      if (items.length === 0) {
        setItemsError("Please add at least one item.");
        return;
      }
      setItemsError("");
    }

    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    if (step === 0 && outOfArea) {
      setOutOfArea(false);
      return;
    }
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: BookingFormValues) => {
    if (items.length === 0) {
      setItemsError("Please add at least one item.");
      setStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      const pickupAddressLine1 = data.address.street;
      const pickupAddressLine2 = data.address.line2 || null;
      const pickupCity = data.address.city;
      const pickupState = data.address.province;

      const pickupPostalCode = data.postalCode;

      const pickupDate = new Date(data.pickupDateTime);
      const preferredDatetime = pickupDate.toISOString();
      const freeCancellationDeadline = new Date(
        pickupDate.getTime() - 24 * 60 * 60 * 1000
      ).toISOString();

      const body = {
        customer: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        },
        deliveryRequired: data.deliveryRequired,
        pickupPostalCode,
        pickupAddressLine1,
        pickupAddressLine2,
        pickupCity,
        pickupState,
        pickupFloor: data.floor ? Number(data.floor) : null,
        pickupElevator: data.hasElevator,
        ...(data.deliveryRequired
          ? {
              deliveryPostalCode: pickupPostalCode,
              deliveryAddressLine1: pickupAddressLine1,
              deliveryAddressLine2: pickupAddressLine2,
              deliveryCity: pickupCity,
              deliveryState: pickupState,
            }
          : {}),
        preferredDatetime,
        freeCancellationDeadline,
        status: "RECEIVED" as const,
        items: items.map((it) => ({
          name: it.name,
          size: it.size,
          quantity: it.quantity,
          description: it.description,
          photoUrl: it.image,
        })),
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.error || "Failed to submit booking");
        return;
      }

      const json = await res.json().catch(() => ({}));
      const requestNumber =
        json?.data?.id?.toString() ||
        Math.floor(Math.random() * 1_000_000).toString();

      setSubmittedRequestNumber(requestNumber);
      setStep(STEPS.length);
    } catch (e) {
      console.error(e);
      alert("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    if (step === STEPS.length) {
      return (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#2f7d4a] text-white text-3xl">
            ✓
          </div>
          <h2 className="mb-3 text-2xl font-semibold text-[#22503B]">
            Your Estimate is coming!
          </h2>
          <p className="mb-2 text-lg font-semibold text-[#22503B]">
            Request Number: {submittedRequestNumber}
          </p>
          <p className="mb-8 max-w-xl text-sm text-slate-600">
            Thanks for submitting the form! Our team will review your info and
            send you a detailed quote based on your items, location, and any
            special requests.
          </p>
          <Button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Go to Main Page
          </Button>
        </div>
      );
    }

    switch (step) {
      case 0:
        if (outOfArea) {
          return (
            <div className="flex justify-center py-8">
              <div className="max-w-xl space-y-4 text-left">
                <p className="text-lg font-semibold text-[#22503B]">
                  We&apos;re sorry...
                </p>
                <p className="text-sm leading-relaxed text-slate-700">
                  It looks like we haven&apos;t reached your area yet.
                  <br />
                  We&apos;re working hard to expand our service and hope to help
                  you say goodbye to your junk soon!
                </p>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <p className="font-semibold text-[#22503B]">Step 1</p>
            <h2 className="text-xl font-semibold text-[#22503B]">
              Where are we Picking up?
            </h2>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <Input placeholder="V6T 2J9" {...register("postalCode")} />
              {errors.postalCode && (
                <p className="text-sm text-red-600">
                  {errors.postalCode.message}
                </p>
              )}
              <p className="text-xs text-slate-500">
                Let&apos;s make sure you&apos;re in our pickup zone.
              </p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <p className="font-semibold text-[#22503B]">Step 2</p>
            <h2 className="text-xl font-semibold text-[#22503B]">
              When are we Picking up?
            </h2>

            <DateTimePicker
              value={watch("pickupDateTime") ?? ""}
              onChange={(v) =>
                setValue("pickupDateTime", v, { shouldValidate: true })
              }
              error={errors.pickupDateTime?.message}
            />

            <div className="mt-4 flex items-center gap-3 text-sm text-[#22503B]">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-[#2f7d4a]"
                  checked={deliveryRequired}
                  onChange={(e) =>
                    setValue("deliveryRequired", e.target.checked)
                  }
                />
                Need Delivery?
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <p className="font-semibold text-[#22503B]">Step 3</p>
            <h2 className="text-xl font-semibold text-[#22503B]">
              Pickup Address
            </h2>

            <AddressInput />

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-800">
                  Which floor is it? <span className="text-red-500">*</span>
                </label>
                <Input placeholder="Floor" {...register("floor")} />
                {errors.floor && (
                  <p className="text-sm text-red-600">
                    {errors.floor.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-800">
                  Is there an elevator? <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4 text-sm text-[#22503B]">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="hasElevator"
                      className="accent-[#2f7d4a]"
                      checked={watch("hasElevator") === true}
                      onChange={() => setValue("hasElevator", true)}
                    />
                    Yes
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="hasElevator"
                      className="accent-[#2f7d4a]"
                      checked={watch("hasElevator") === false}
                      onChange={() => setValue("hasElevator", false)}
                    />
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <p className="font-semibold text-[#22503B]">Step 4</p>
            <h2 className="text-xl font-semibold text-[#22503B]">
              Size of Items
            </h2>

            <p className="text-xs text-slate-500">
              Uploading Pictures is optional
            </p>

            <ItemList
              items={items}
              onChange={(updatedItems) => {
                setItems(updatedItems);
                if (updatedItems.length > 0) setItemsError("");
              }}
            />

            {itemsError && <p className="text-sm text-red-600">{itemsError}</p>}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <p className="font-semibold text-[#22503B]">Step 5</p>
            <h2 className="text-xl font-semibold text-[#22503B]">
              Your Details
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-800">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input placeholder="First Name" {...register("firstName")} />
                {errors.firstName && (
                  <p className="text-sm text-red-600">
                    {errors.firstName.message}
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
                    {errors.lastName.message}
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
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-800">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input placeholder="Phone Number" {...register("phone")} />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-[#22503B]">
              Confirmation
            </h2>

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
                  <span>
                    {pickupDateTime
                      ? new Date(pickupDateTime).toLocaleString()
                      : "-"}
                  </span>

                  <span className="font-medium">Pickup Address</span>
                  <span>
                    {addressValue.street}
                    {addressValue.line2 ? `, ${addressValue.line2}` : ""}
                    <br />
                    {addressValue.city}, {addressValue.province}
                  </span>

                  <span className="font-medium">Other</span>
                  <span>
                    {watch("floor") || "-"} floor /{" "}
                    {watch("hasElevator") ? "Elevator" : "No elevator"}
                  </span>
                </div>
              </div>
            </section>

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
                              <span className="text-slate-500 ml-2 text-xs">
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

                  <span className="font-medium">Address</span>
                  <span>
                    {addressValue.street}
                    {addressValue.line2 ? `, ${addressValue.line2}` : ""}
                    <br />
                    {addressValue.city}, {addressValue.province}
                  </span>
                </div>
              </div>
            </section>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="mb-10 flex flex-col items-center">
          <div className="w-full max-w-xs md:hidden">
            <div className="flex flex-col gap-4">
              {STEPS.slice(0, 5).map((label, index) => {
                const active = index === step;
                const completed = index < step;

                return (
                  <div key={label} className="flex">
                    <div className="flex flex-col items-center mr-3">
                      <div
                        className={
                          "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold " +
                          (completed
                            ? "border-[#2f7d4a] text-[#2f7d4a] bg-white"
                            : active
                              ? "border-[#2f7d4a] text-[#2f7d4a] bg-white"
                              : "border-slate-300 text-slate-400 bg-white")
                        }
                      >
                        {completed ? (
                          <span className="text-lg leading-none">✓</span>
                        ) : (
                          index + 1
                        )}
                      </div>
                      {index < 4 && (
                        <div
                          className={
                            "mt-1 h-8 border-l-2 " +
                            (index < step
                              ? "border-[#2f7d4a]"
                              : "border-dashed border-slate-300")
                          }
                        />
                      )}
                    </div>
                    <div className="pt-1">
                      <p
                        className={
                          "text-sm " +
                          (active
                            ? "font-semibold text-slate-900"
                            : "text-slate-600")
                        }
                      >
                        {label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hidden w-full max-w-3xl items-center justify-between text-xs text-slate-600 md:flex md:text-sm">
            {STEPS.slice(0, 5).map((label, index) => {
              const active = index === step;
              const completed = index < step;
              const lineCompleted = index < step;

              return (
                <div key={label} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold shadow-sm " +
                        (completed
                          ? "border-[#2f7d4a] text-[#2f7d4a] bg-white"
                          : active
                            ? "border-[#2f7d4a] text-[#2f7d4a] bg-white"
                            : "border-slate-300 text-slate-400 bg-white")
                      }
                    >
                      {completed ? (
                        <span className="text-lg leading-none">✓</span>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={
                        "text-[11px] md:text-[13px] " +
                        (active
                          ? "font-semibold text-slate-900"
                          : "text-slate-600")
                      }
                    >
                      {label}
                    </span>
                  </div>

                  {index < 4 && (
                    <div
                      className={
                        "mt-[-20px] flex-1 border-t-2 " +
                        (lineCompleted
                          ? "border-[#2f7d4a]"
                          : "border-dashed border-slate-300")
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            if (step === 5) {
              handleSubmit(onSubmit)(e);
            } else {
              e.preventDefault();
            }
          }}
          className="rounded-xl border border-[#e0e7e2] bg-white px-6 py-8 md:px-10 md:py-10 shadow-sm"
        >
          {renderStep()}

          {step < STEPS.length && (
            <div className="mt-10 flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={step === 0 && !outOfArea}
                className="flex w-full sm:w-40 items-center justify-center gap-2 rounded-md border-[#3F7253] bg-white text-[#3F7253] hover:bg-[#e7f0eb] hover:text-[#3F7253] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>

              {!(step === 0 && outOfArea) && (
                <>
                  {step <= 4 && (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="flex w-full sm:w-40 items-center justify-center gap-2 rounded-md bg-[#3F7253] text-white hover:bg-[#315e45]"
                    >
                      <span>Next</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}

                  {step === 5 && (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full sm:w-40 items-center justify-center gap-2 rounded-md bg-[#3F7253] text-white hover:bg-[#315e45] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </form>
      </div>
    </FormProvider>
  );
}
