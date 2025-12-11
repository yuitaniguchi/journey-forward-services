"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupportedPostalCode, POSTAL_CODE_REGEX } from "@/lib/postalCodes";

export default function AvailabilityCheckSection() {
  const router = useRouter();
  const [postalCode, setPostalCode] = useState("");
  const [error, setError] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isAvailable) {
      setLoading(true);
      router.push(`/booking?postalCode=${encodeURIComponent(postalCode)}`);
      return;
    }

    const normalized = postalCode.trim().toUpperCase();

    if (!normalized || !POSTAL_CODE_REGEX.test(normalized)) {
      setError("Please enter a valid postal code (e.g. V5K 0A1).");
      return;
    }

    if (!isSupportedPostalCode(normalized)) {
      setError("Sorry, we currently do not service this area.");
      return;
    }

    setPostalCode(normalized);
    setIsAvailable(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostalCode(e.target.value);
    if (error) setError("");
    if (isAvailable) setIsAvailable(false);
  };

  return (
    <section className="bg-white py-16 md:py-24 px-4 md:px-0">
      <div className="section-inner flex flex-col items-center text-center space-y-8">
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-3xl font-semibold text-slate-900">
            Check Service Availability
          </h2>
          <p className="text-slate-600">
            Enter your postal code to see if we service your area and get
            started with your booking.
          </p>
        </div>

        <form onSubmit={handleCheckAvailability} className="w-full">
          {/* Main Card Container */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-between w-full max-w-[600px] mx-auto bg-white rounded-xl shadow-sm border p-4 sm:p-2 sm:pl-6 sm:pr-2 transition-colors duration-300 ${
              isAvailable
                ? "border-brand ring-1 ring-brand"
                : "border-slate-200"
            }`}
          >
            {/* Left Side: Icon + Inputs */}
            <div className="flex items-center gap-3 sm:gap-5 w-full sm:flex-1 overflow-hidden">
              {isAvailable ? (
                <CheckCircle2
                  className="h-6 w-6 text-brand shrink-0"
                  strokeWidth={2}
                />
              ) : (
                <MapPin
                  className="h-6 w-6 text-slate-800 shrink-0"
                  strokeWidth={2}
                />
              )}

              <div className="flex flex-col items-start w-full text-left overflow-hidden">
                <label
                  htmlFor="postal-code-section"
                  className="text-base font-semibold text-slate-900 leading-tight cursor-pointer"
                >
                  Postal code
                </label>

                <input
                  id="postal-code-section"
                  value={postalCode}
                  onChange={handleInputChange}
                  placeholder="Check if your location is available"
                  className="w-full mt-0.5 border-none bg-transparent p-0 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0 truncate"
                />
              </div>
            </div>

            {/* Right Side: Button */}
            <Button
              type="submit"
              disabled={loading}
              className={`mt-4 sm:mt-0 ml-0 sm:ml-4 w-full sm:w-auto border rounded-lg h-10 px-6 font-medium whitespace-nowrap transition-all ${
                isAvailable
                  ? "bg-brand text-white border-brand hover:bg-brand/90"
                  : "bg-white text-brand border-brand hover:bg-slate-50"
              }`}
            >
              {loading
                ? "Loading..."
                : isAvailable
                  ? "Book Now"
                  : "Check Availability"}
            </Button>
          </div>

          {/* Success / Error Messages */}
          <div className="h-6 mt-4">
            {" "}
            {error && (
              <p className="text-sm text-red-500 font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </p>
            )}
            {isAvailable && (
              <p className="text-sm text-brand font-medium animate-in fade-in slide-in-from-top-1">
                Great news! We service your area.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
