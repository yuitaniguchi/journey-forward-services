import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function BookingSubmittedPage({ params }: PageProps) {
  const { token } = await params;

  const quotation = await prisma.quotation.findFirst({
    where: {
      bookingLink: {
        contains: token,
      },
    },
    include: {
      request: true,
    },
  });

  if (!quotation || !quotation.request) {
    return notFound();
  }

  const booking = quotation.request;

  return (
    <main className="min-h-screen bg-white py-16 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-12 md:grid-cols-2 items-start">
          <div className="flex flex-col items-center justify-center text-center py-10">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-[#367D5E] to-[#53C090] text-white">
              <Check className="h-10 w-10" strokeWidth={3} />
            </div>

            <h1 className="mb-4 text-4xl font-bold text-[#22503B]">
              Thank you for Booking!
            </h1>

            <p className="text-2xl font-bold text-[#22503B]">
              Request Number: {booking.id}
            </p>
          </div>

          <div className="space-y-8 text-sm text-gray-800 leading-relaxed">
            <p className="text-base">
              We&apos;ll send your details of booking by email shortly
            </p>

            <div>
              <h3 className="font-bold mb-1">When Will You Be Charged?</h3>
              <p>
                Your payment will only be processed after the service is
                completed, once we issue the final invoice. You&apos;ll receive
                an email with the full breakdown before the charge is made.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-1">Cancellation Policy</h3>
              <p className="mb-2">
                We understand that plans may change. Here&apos;s how
                cancellations work:
              </p>
              <p className="mb-2">
                Free cancellation is available up to 24 hours before your
                scheduled pick-up time.
              </p>
              <p>
                If you cancel within 24 hours of the scheduled pick-up, a
                cancellation fee of $25 will be charged to your registered
                credit card.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-1">Questions?</h3>
              <p>
                If you have any questions, feel free to reply to this email or
                call us. We&apos;re happy to help!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <Link href="/">
            <Button className="bg-brand hover:bg-[#3b7256] text-white px-8 py-6 text-base rounded-md font-medium">
              Go to Main Page
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
