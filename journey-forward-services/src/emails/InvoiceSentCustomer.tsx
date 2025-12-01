import { Text, Heading, Section, Button, Hr } from "@react-email/components";
import * as React from "react";
import { Layout } from "./components/Layout";
import { QuotationSentProps } from "../types/email";

interface InvoiceProps extends QuotationSentProps {
  finalTotal: number;
  paymentLink: string;
}

export const InvoiceSentCustomer: React.FC<InvoiceProps> = ({
  customer,
  request,
  finalTotal,
  paymentLink,
  requestDate,
}) => {
  const previewText = "【Journey Forward Services】Your Final Invoice is Ready";

  const formattedTotal = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(finalTotal);

  return (
    <Layout previewText={previewText}>
      <Heading className="text-2xl font-bold text-[#367D5E] my-6">
        Your Final Invoice Is Ready
      </Heading>

      <Text className="text-base text-gray-700">Hi {customer?.firstName},</Text>

      <Text className="text-base text-gray-700">
        Thank you for choosing Journey Forward Services.
        <br />
        We have finalized the invoice for your Request{" "}
        <strong>#{request?.requestId}</strong>.
      </Text>

      <Section className="bg-gray-50 p-4 mt-6 border border-solid border-gray-200 rounded-md text-center">
        <Text className="text-sm font-semibold text-gray-700 m-0">
          Total Amount Due
        </Text>
        <Text className="text-5xl font-extrabold text-red-600 m-0 mt-1">
          {formattedTotal}
        </Text>
      </Section>

      <Text className="text-base text-gray-700 mt-6">
        Please click the button below to proceed to the payment page and
        complete your transaction.
      </Text>

      <Section className="text-center mt-6 mb-8">
        <Button
          href={paymentLink}
          className="bg-red-600 text-white font-bold py-3 px-6 rounded-md text-base"
        >
          Pay Invoice
        </Button>
      </Section>

      <Hr className="border border-solid border-gray-200 my-4" />
    </Layout>
  );
};

export default InvoiceSentCustomer;
