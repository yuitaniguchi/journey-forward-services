"use client";

type Props = {
  currentStep: number;
  steps: readonly string[];
};

export default function StepIndicator({ currentStep, steps }: Props) {
  const displaySteps = steps.slice(0, 5);

  return (
    <div className="mb-10 flex flex-col items-center">
      {/* Mobile View: Vertical List */}
      <div className="w-full max-w-xs md:hidden">
        <div className="flex flex-col gap-4">
          {displaySteps.map((label, index) => {
            const active = index === currentStep;
            const completed = index < currentStep;

            return (
              <div key={label} className="flex">
                <div className="mr-3 flex flex-col items-center">
                  <div
                    className={
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold " +
                      (completed
                        ? "border-[#2f7d4a] bg-white text-[#2f7d4a]"
                        : active
                          ? "border-[#2f7d4a] bg-white text-[#2f7d4a]"
                          : "border-slate-300 bg-white text-slate-400")
                    }
                  >
                    {completed ? (
                      <span className="text-lg leading-none">✓</span>
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < displaySteps.length - 1 && (
                    <div
                      className={
                        "mt-1 h-8 border-l-2 " +
                        (index < currentStep
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

      {/* Desktop View: Horizontal Bar */}
      <div className="hidden w-full max-w-3xl items-center justify-between text-xs text-slate-600 md:flex md:text-sm">
        {displaySteps.map((label, index) => {
          const active = index === currentStep;
          const completed = index < currentStep;
          const lineCompleted = index < currentStep;

          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold shadow-sm " +
                    (completed
                      ? "border-[#2f7d4a] bg-white text-[#2f7d4a]"
                      : active
                        ? "border-[#2f7d4a] bg-white text-[#2f7d4a]"
                        : "border-slate-300 bg-white text-slate-400")
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
                    (active ? "font-semibold text-slate-900" : "text-slate-600")
                  }
                >
                  {label}
                </span>
              </div>

              {index < displaySteps.length - 1 && (
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
  );
}
