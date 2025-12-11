import { Text, Heading, Section, Button, Hr } from "@react-email/components";
import * as React from "react";
import { LayoutAdmin } from "./components/LayoutAdmin";
import { BookingReceivedProps } from "../types/email";

interface CancellationAdminProps extends BookingReceivedProps {
  cancellationFee: number;
  dashboardLink: string;
}

export const CancellationNotificationAdmin: React.FC<
  CancellationAdminProps
> = ({ customer, request, cancellationFee, dashboardLink, requestDate }) => {
  const isFree = cancellationFee === 0;

  const formattedFee = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cancellationFee);

  const previewText = `[Admin Alert] Request #${request?.requestId} Cancelled`;

  return (
    <LayoutAdmin previewText={previewText}>
      <Heading className="text-xl font-bold text-red-600 my-6">
        Request Cancelled
      </Heading>

      <Text className="text-base text-gray-700">
        Request <strong>#{request?.requestId}</strong> has been cancelled.
      </Text>

      <Section
        className={`p-4 mt-4 border border-solid rounded-md ${
          isFree ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
        }`}
      >
        <Text className="text-sm font-semibold text-gray-700 m-0">
          Cancellation Fee Status
        </Text>
        <Text className="text-lg font-bold m-0 mt-1">
          {isFree
            ? "Free Cancellation (No Charge)"
            : `Fee Applied: ${formattedFee}`}
        </Text>
      </Section>

      <Section className="mt-6">
        <Heading as="h3" className="text-md font-bold text-gray-700">
          Customer Information
        </Heading>
        <Text className="text-base text-gray-700 m-0">
          {customer?.firstName} {customer?.lastName}
        </Text>
        <Text className="text-base text-gray-700 m-0">
          <a
            href={`mailto:${customer?.email}`}
            className="text-blue-600 underline"
          >
            {customer?.email}
          </a>
        </Text>
        <Text className="text-base text-gray-700 m-0">
          <a
            href={`tel:${customer?.phone}`}
            className="text-blue-600 underline"
          >
            {customer?.phone}
          </a>
        </Text>
      </Section>

      <Section className="text-center mt-8 mb-4">
        <Button
          href={dashboardLink}
          className="bg-blue-600 text-white font-bold py-3 px-6 rounded-md text-sm"
        >
          View Request in Dashboard
        </Button>
      </Section>

      <Hr className="border-gray-200 my-4" />
      <Text className="text-xs text-gray-500 text-center">
        ManageSmartr Admin Notification
      </Text>
    </LayoutAdmin>
  );
};

export default CancellationNotificationAdmin;
