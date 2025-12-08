"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Item } from "./ItemList";
import { isSupportedPostalCode } from "@/lib/postalCodes";

import { bookingSchema, BookingFormValues } from "@/lib/schemas/booking";

import StepIndicator from "./StepIndicator";
import StepPostalCode from "./steps/StepPostalCode";
import StepDateTime from "./steps/StepDateTime";
import StepAddress from "./steps/StepAddress";
import StepItems from "./steps/StepItems";
import StepUserInfo from "./steps/StepUserInfo";
import StepConfirmation from "./steps/StepConfirmation";
import StepSuccess from "./steps/StepSuccess"; // ★追加: 新しいコンポーネントをインポート

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
      deliveryAddress: {
        street: "",
        line2: "",
        city: "",
        province: "BC",
      },
      deliveryFloor: "",
      deliveryElevator: false,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  const {
    handleSubmit,
    trigger,
    getValues,
    watch,
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

  // 各ステップでバリデーションが必要なフィールド
  const stepFields: any[][] = [
    ["postalCode"],
    ["pickupDateTime"],
    deliveryRequired
      ? [
          "address.street",
          "address.city",
          "floor",
          "deliveryAddress.street",
          "deliveryAddress.city",
          "deliveryFloor",
        ]
      : ["address.street", "address.city", "floor"],
    [],
    ["firstName", "lastName", "email", "phone"],
    [],
  ];

  const handleNext = async () => {
    const fields = stepFields[step];
    if (fields.length > 0) {
      const ok = await trigger(fields as any);
      if (!ok) return;
    }

    // Step 0: Postal Code Check
    if (step === 0) {
      const postal = getValues("postalCode")?.trim() ?? "";
      if (!isSupportedPostalCode(postal)) {
        setOutOfArea(true);
        return;
      } else {
        setOutOfArea(false);
      }
    }

    // Step 3: Items Check
    if (step === 3) {
      if (items.length === 0) {
        setItemsError("Please add at least one item.");
        return;
      }
      setItemsError("");
    }

    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (step === 0 && outOfArea) {
      setOutOfArea(false);
      return;
    }
    setStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const onSubmit = async (data: BookingFormValues) => {
    if (items.length === 0) {
      setItemsError("Please add at least one item.");
      setStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      const pickupDate = new Date(data.pickupDateTime);
      const preferredDatetime = pickupDate.toISOString();
      const freeCancellationDeadline = new Date(
        pickupDate.getTime() - 24 * 60 * 60 * 1000
      ).toISOString();

      const pickupFloorStr = data.floor || null;
      const deliveryFloorStr = data.deliveryFloor || null;

      const body = {
        customer: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        },
        deliveryRequired: data.deliveryRequired,

        pickupPostalCode: data.postalCode,
        pickupAddressLine1: data.address.street,
        pickupAddressLine2: data.address.line2 || null,
        pickupCity: data.address.city,
        pickupState: data.address.province,
        pickupFloor: pickupFloorStr,
        pickupElevator: data.hasElevator,

        ...(data.deliveryRequired && data.deliveryAddress
          ? {
              deliveryPostalCode: data.postalCode,
              deliveryAddressLine1: data.deliveryAddress.street,
              deliveryAddressLine2: data.deliveryAddress.line2 || null,
              deliveryCity: data.deliveryAddress.city,
              deliveryState: data.deliveryAddress.province,
              deliveryFloor: deliveryFloorStr,
              deliveryElevator: data.deliveryElevator,
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
      const requestNumber = json?.data?.id?.toString() || "Error";

      setSubmittedRequestNumber(requestNumber);
      setStep(STEPS.length);
      window.scrollTo(0, 0);
    } catch (e) {
      console.error(e);
      alert("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    // 完了画面
    if (step === STEPS.length) {
      // ★変更: 新しいコンポーネントを使用
      return <StepSuccess requestNumber={submittedRequestNumber || "Error"} />;
    }

    // 各ステップのコンポーネント
    switch (step) {
      case 0:
        return <StepPostalCode outOfArea={outOfArea} />;
      case 1:
        return <StepDateTime />;
      case 2:
        return <StepAddress />;
      case 3:
        return (
          <StepItems
            items={items}
            setItems={setItems}
            itemsError={itemsError}
            setItemsError={setItemsError}
          />
        );
      case 4:
        return <StepUserInfo />;
      case 5:
        return <StepConfirmation items={items} setStep={setStep} />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-3xl space-y-8">
        <StepIndicator currentStep={step} steps={STEPS} />

        <form
          onSubmit={(e) => {
            if (step === 5) {
              handleSubmit(onSubmit)(e);
            } else {
              e.preventDefault();
            }
          }}
          className=""
        >
          {/* コンテンツ部分 */}
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-8 md:px-10 md:py-10 shadow-sm">
            {renderStep()}
          </div>

          {/* ボタン (完了画面以外で表示) */}
          {step < STEPS.length && (
            <div className="mt-8 flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
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
