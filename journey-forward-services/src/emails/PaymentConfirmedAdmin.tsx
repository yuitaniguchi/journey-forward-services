import {
  Text,
  Heading,
  Section,
  Button,
  Hr,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";
import { LayoutAdmin } from "./components/LayoutAdmin";
import { BookingReceivedProps } from "../types/email";

interface PaymentConfirmedAdminProps extends BookingReceivedProps {
  finalTotal: number;
  dashboardLink: string;
  subTotal?: number;
  discountAmount?: number;
}

export const PaymentConfirmedAdmin: React.FC<PaymentConfirmedAdminProps> = ({
  customer,
  request,
  finalTotal,
  dashboardLink,
  requestDate,
  subTotal,
  discountAmount,
}) => {
  const formattedTotal = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(finalTotal);

  const previewText = `[Payment Received] Request #${request?.requestId} - ${customer?.lastName}`;

  return (
    <LayoutAdmin previewText={previewText}>
      <Heading className="text-xl font-bold text-gray-800 my-6">
        Payment Received Notification
      </Heading>

      <Text className="text-base text-gray-700">
        Payment has been successfully received for the following request.
      </Text>

      <Section className="bg-gray-100 p-4 rounded-md border border-gray-300">
        <Row>
          <Column>
            <Text className="text-sm text-gray-500 m-0">Request ID</Text>
            <Text className="text-lg font-bold text-gray-800 m-0">
              #{request?.requestId}
            </Text>
          </Column>
          <Column>
            <Text className="text-sm text-gray-500 m-0">Amount Received</Text>
            <Text className="text-lg font-bold text-green-600 m-0">
              {formattedTotal}
            </Text>

            {discountAmount !== undefined && discountAmount > 0 && (
              <Text className="text-xs text-red-600 m-0 mt-1">
                (Includes discount: -
                {new Intl.NumberFormat("en-CA", {
                  style: "currency",
                  currency: "CAD",
                }).format(discountAmount)}
                )
              </Text>
            )}
          </Column>
        </Row>
      </Section>

      <Section className="mt-6">
        <Heading as="h3" className="text-md font-bold text-gray-700">
          Customer Details
        </Heading>
        <Text className="text-base text-gray-700 m-0">
          Name:{" "}
          <strong>
            {customer?.firstName} {customer?.lastName}
          </strong>
        </Text>
        <Text className="text-base text-gray-700 m-0">
          Email: {customer?.email}
        </Text>
        <Text className="text-base text-gray-700 m-0">
          Phone: {customer?.phone}
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
        This is an automated notification for the admin team.
      </Text>
    </LayoutAdmin>
  );
};

export default PaymentConfirmedAdmin;
