import { Text, Heading, Section, Img } from "@react-email/components";
import * as React from "react";
import { Layout } from "./components/Layout";
import { BookingReceivedProps } from "../types/email";

const HERO_IMAGE_URL =
  "https://res.cloudinary.com/doh9afvyd/image/upload/v1764872936/email-payment_npifgo.jpg";

interface PaymentConfirmedCustomerProps extends BookingReceivedProps {
  finalTotal: number;
}

export const PaymentConfirmedCustomer: React.FC<
  PaymentConfirmedCustomerProps
> = ({ customer, request, finalTotal }) => {
  const formattedTotal = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(finalTotal);

  const previewText = "【Journey Forward Services】Payment Confirmed";

  return (
    <Layout previewText={previewText}>
      <Section className="text-center">
        <Img src={HERO_IMAGE_URL} width="70%" alt="Your Estimate is coming!" />
      </Section>

      <Heading className="text-2xl font-bold text-[#367D5E] my-6">
        Payment Confirmed! Thank You!
      </Heading>

      <Text className="text-base text-gray-700">Hi {customer?.firstName},</Text>

      <Text className="text-base text-gray-700">
        We have confirmed your payment of {formattedTotal} for Request #
        {request?.requestId}.
        <br />
        Your transaction is now complete. We look forward to serving you again!
      </Text>

      <Section className="bg-green-50 p-4 mt-6 border border-solid border-green-200 rounded-md text-center">
        <Text className="text-sm font-semibold text-gray-700 m-0">
          Total Paid
        </Text>
        <Text className="text-4xl font-bold text-green-700 m-0 mt-1">
          {formattedTotal}
        </Text>
      </Section>

      <Text className="text-sm text-gray-600 mt-6">
        Please save this email as your receipt. If you require a formal tax
        invoice, please contact us.
      </Text>
    </Layout>
  );
};

export default PaymentConfirmedCustomer;
