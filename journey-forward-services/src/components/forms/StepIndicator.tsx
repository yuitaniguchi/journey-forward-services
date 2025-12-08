"use client";

import React from "react";
import { Check } from "lucide-react";

type Props = {
  currentStep: number;
  steps: readonly string[];
};

export default function StepIndicator({ currentStep, steps }: Props) {
  const displaySteps = steps.slice(0, 5);

  return (
    <div className="w-full">
      {/* Mobile View */}
      <div className="mb-8 flex justify-center bg-[#F8F9FA] py-8 md:hidden">
        <div className="flex flex-col gap-0">
          {displaySteps.map((label, index) => {
            const active = index === currentStep;
            const completed = index < currentStep;
            const isLastStep = index === displaySteps.length - 1;

            return (
              <div
                key={label}
                className="relative flex pb-4 last:pb-0 min-h-[48px]"
              >
                {!isLastStep && (
                  <div
                    className={
                      "absolute left-[16px] top-8 h-full w-[2px] -translate-x-1/2 " +
                      (completed
                        ? "bg-[#2f7d4a]"
                        : "border-l-2 border-dashed border-slate-300")
                    }
                  />
                )}

                <div className="z-10 mr-4 flex flex-col items-center">
                  <div
                    className={
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all shadow-sm " +
                      (completed
                        ? "border-[#2f7d4a] bg-white text-[#2f7d4a]"
                        : active
                          ? "scale-110 border-white bg-white text-slate-900 shadow-md"
                          : "border-white bg-slate-100 text-slate-400")
                    }
                  >
                    {completed ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                </div>

                <div className="flex items-center pt-1">
                  <p
                    className={
                      "text-sm whitespace-nowrap " +
                      (active
                        ? "font-bold text-slate-900"
                        : "font-medium text-slate-500")
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

      {/* Desktop View */}
      <div className="hidden w-full max-w-4xl flex-row items-start justify-between md:flex">
        {displaySteps.map((label, index) => {
          const active = index === currentStep;
          const completed = index < currentStep;
          const isLastStep = index === displaySteps.length - 1;

          return (
            <div
              key={label}
              className="relative flex flex-1 flex-col items-center"
            >
              {!isLastStep && (
                <div
                  className={
                    "absolute left-1/2 top-5 w-full -translate-y-1/2 " +
                    (completed
                      ? "h-[2px] bg-[#2f7d4a]"
                      : "h-0 border-t-2 border-dashed border-slate-300")
                  }
                />
              )}

              <div
                className={
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-200 shadow-sm " +
                  (completed
                    ? "border-[#2f7d4a] bg-white text-[#2f7d4a]" // 完了
                    : active
                      ? "scale-110 border-white bg-white text-slate-900 shadow-lg" // 現在: 影を強く(shadow-lg)して強調
                      : "border-white bg-slate-100 text-slate-400") // 未完了
                }
              >
                {completed ? <Check className="h-5 w-5" /> : index + 1}
              </div>

              <span
                className={
                  "mt-4 text-xs tracking-wide " +
                  (active
                    ? "font-bold text-slate-900"
                    : "font-medium text-slate-500")
                }
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
