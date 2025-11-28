// src/app/(user)/payment-confirmation/[id]/page.tsx

type PaymentConfirmationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PaymentConfirmationPage({
  params,
}: PaymentConfirmationPageProps) {
  // Next.js 16 では params が Promise なので await する
  const { id } = await params;
  const bookingId = id;

  return (
    <main className="min-h-screen bg-[#f7f7f7] py-16">
      <div className="mx-auto max-w-2xl rounded-xl bg-white px-8 py-12 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <span className="text-2xl">✅</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#1a7c4c]">
            Payment Completed
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Thank you! Your payment has been processed successfully.
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
          <p className="font-semibold text-gray-800">Booking information</p>
          <p className="mt-1 text-gray-700">
            <span className="font-medium">Booking ID:</span> {bookingId}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            You&apos;ll receive a confirmation email with the full breakdown and
            receipt shortly.
          </p>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500 leading-relaxed">
          <p>
            If you have any questions about your booking or payment, please
            contact our support team with your Booking ID.
          </p>
        </div>
      </div>
    </main>
  );
}
