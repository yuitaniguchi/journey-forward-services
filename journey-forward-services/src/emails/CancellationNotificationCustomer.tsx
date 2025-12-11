import { Text, Heading, Section, Img } from "@react-email/components";
import * as React from "react";
import { Layout } from "./components/Layout";
import { BookingReceivedProps } from "../types/email";

const CANCEL_IMAGE_URL =
  "https://res.cloudinary.com/doh9afvyd/image/upload/v1764822002/email-cancel_fvkpvn.jpg";

interface CancellationCustomerProps extends BookingReceivedProps {
  cancellationFee: number;
}

export const CancellationNotificationCustomer: React.FC<
  CancellationCustomerProps
> = ({ customer, request, cancellationFee }) => {
  const isFree = cancellationFee === 0;

  const formattedFee = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cancellationFee);

  const previewText = `[Cancellation] Booking for Request #${request?.requestId} has been cancelled`;

  const title = isFree
    ? "Booking Cancelled"
    : "Booking Cancelled (Fee Applied)";

  const feeMessage = isFree
    ? "No cancellation fee was applied."
    : `In accordance with our cancellation policy, a cancellation fee of ${formattedFee} has been charged to your registered card.`;

  return (
    <Layout previewText={previewText}>
      <Section className="text-center">
        <Img src={CANCEL_IMAGE_URL} width="70%" alt="Booking Cancelled" />
      </Section>

      <Heading className="text-2xl font-bold text-[#367D5E] my-4">
        {title}
      </Heading>

      <Text className="text-base text-gray-700">Hi {customer?.firstName},</Text>

      <Text className="text-base text-gray-700 font-bold">
        Your booking for Request #{request?.requestId} has been cancelled.
      </Text>

      <Section
        className={`p-4 mt-6 border border-solid rounded-md ${
          isFree ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
        }`}
      >
        <Text className="text-sm font-semibold text-gray-700 m-0">
          Cancellation Fee Status
        </Text>
        <Text className="text-base font-bold m-0 mt-1">{feeMessage}</Text>
      </Section>

      <Text className="text-sm text-gray-600 mt-6">
        For full details regarding our cancellation policy, please check your
        booking confirmation email or visit our website.
      </Text>
    </Layout>
  );
};

export default CancellationNotificationCustomer;
