import {
  Text,
  Heading,
  Section,
  Button,
  Hr,
  Img,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";
import { Layout } from "./components/Layout";
import { QuotationSentProps } from "../types/email";

const HERO_IMAGE_URL =
  "https://res.cloudinary.com/doh9afvyd/image/upload/v1764872923/email-invoice_hqzyvr.jpg";

interface InvoiceProps extends QuotationSentProps {
  finalTotal: number;
  paymentLink: string;
}

export const InvoiceSentCustomer: React.FC<InvoiceProps> = ({
  customer,
  request,
  subTotal,
  tax,
  discountAmount = 0,
  finalTotal,
  paymentLink,
  requestDate,
}) => {
  const previewText = "【Journey Forward Services】Your Final Invoice is Ready";

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(val);

  return (
    <Layout previewText={previewText}>
      <Section className="text-center">
        <Img src={HERO_IMAGE_URL} width="70%" alt="Your Estimate is coming!" />
      </Section>

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
        {discountAmount > 0 && (
          <Section className="mb-4 px-4">
            <Row>
              <Column align="left">
                <Text className="m-0 text-gray-600 text-sm">Subtotal:</Text>
              </Column>
              <Column align="right">
                <Text className="m-0 text-gray-600 text-sm font-medium">
                  {formatCurrency(subTotal)}
                </Text>
              </Column>
            </Row>
            <Row>
              <Column align="left">
                <Text className="m-0 text-[#E04F4F] text-sm">Discount:</Text>
              </Column>
              <Column align="right">
                <Text className="m-0 text-[#E04F4F] text-sm font-medium">
                  -{formatCurrency(discountAmount)}
                </Text>
              </Column>
            </Row>
            <Row>
              <Column align="left">
                <Text className="m-0 text-gray-600 text-sm">Tax (12%):</Text>
              </Column>
              <Column align="right">
                <Text className="m-0 text-gray-600 text-sm font-medium">
                  {formatCurrency(tax)}
                </Text>
              </Column>
            </Row>
            <Hr className="border-gray-300 my-2" />
          </Section>
        )}

        <Text className="text-sm font-semibold text-gray-700 m-0">
          Total Amount Due
        </Text>
        <Text className="text-5xl font-extrabold text-red-600 m-0 mt-1">
          {formatCurrency(finalTotal)}
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
