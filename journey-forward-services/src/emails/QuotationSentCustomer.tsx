import {
  Text,
  Heading,
  Section,
  Link,
  Button,
  Img,
} from "@react-email/components";
import * as React from "react";
import { Layout } from "./components/Layout";
import { QuotationSentProps, ItemData } from "../types/email";

const QUOTE_IMAGE_URL =
  "https://res.cloudinary.com/doh9afvyd/image/upload/v1764549570/quotation-sent_x4o68t.png";

interface ExtendedQuotationSentProps extends QuotationSentProps {
  subTotal: number;
  tax: number;
  pdfLink: string;
  items: (ItemData & { price: number; delivery: boolean })[];
}

export const QuotationSentCustomer: React.FC<ExtendedQuotationSentProps> = ({
  customer,
  request,
  quotationTotal,
  bookingLink,
  requestDate,
  subTotal,
  tax,
  pdfLink,
  items,
}) => {
  const previewText = "Your Estimate is Ready – Please Confirm Your Pick-Up";

  const formatCAD = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  const formatDateTime = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  };

  const getFloorDisplay = (
    floor: string | number | null | undefined
  ): string | null => {
    if (floor === null || floor === undefined || floor === "") return null;

    const num = Number(floor);
    if (!isNaN(num) && floor !== "") {
      const suffixes = ["th", "st", "nd", "rd"];
      const value = num % 100;
      return (
        num +
        (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]) +
        " floor"
      );
    }

    return `${floor} floor`;
  };

  const getDetailsString = (
    floor: string | number | null | undefined,
    elevator?: boolean | null
  ) => {
    const floorText = getFloorDisplay(floor);
    const elevatorText =
      elevator !== undefined && elevator !== null
        ? elevator
          ? "Elevator available"
          : "No elevator"
        : null;

    if (floorText && elevatorText) {
      return `${floorText} / ${elevatorText}`;
    } else if (floorText) {
      return floorText;
    } else if (elevatorText) {
      return elevatorText;
    }
    return null;
  };

  const pickupDetails = getDetailsString(
    request?.pickupFloor,
    request?.pickupElevator
  );
  const deliveryDetails = getDetailsString(
    (request as any).deliveryFloor,
    (request as any).deliveryElevator
  );

  return (
    <Layout previewText={previewText}>
      <Section className="text-center">
        <Img
          src={QUOTE_IMAGE_URL}
          width="100%"
          style={{ maxWidth: "400px" }}
          alt="Delivery Illustration"
        />
      </Section>

      <Heading className="text-2xl font-bold text-[#367D5E] text-left my-6">
        Your Estimate is Ready
        <br />– Please Confirm Your Pick-Up
      </Heading>

      <Heading
        as="h2"
        className="text-xl font-bold text-gray-900 text-left mb-4"
      >
        Request Number: {request?.requestId}
      </Heading>

      <Text className="text-base text-gray-700 mb-4">
        Hi {customer?.firstName},
      </Text>
      <Text className="text-base text-gray-700 mb-6">
        Thank you again for your request.
        <br />
        We've carefully reviewed the details you provided and have prepared an
        accurate estimate for your upcoming pick-up service.
      </Text>

      <Section className="mb-6">
        <Heading as="h3" className="text-lg font-bold mb-2">
          Estimate Summary:
        </Heading>
        <Text className="text-base text-gray-700 m-0">
          <strong className="text-[#367D5E]">Pickup Date:</strong>{" "}
          {request?.preferredDatetime
            ? formatDateTime(request.preferredDatetime)
            : "-"}
        </Text>

        {/* Pickup Info */}
        <Text className="text-base text-gray-700 m-0 mt-1">
          <strong className="text-[#367D5E]">Pickup Address:</strong>{" "}
          {request?.pickupAddress}
        </Text>
        {pickupDetails && (
          <Text className="text-xs text-gray-500 m-0 ml-4">
            └ {pickupDetails}
          </Text>
        )}

        {/* Delivery Info  */}
        {request?.deliveryAddress && (
          <>
            <Text className="text-base text-gray-700 m-0 mt-2">
              <strong className="text-[#367D5E]">Delivery Address:</strong>{" "}
              {request.deliveryAddress}
            </Text>
            {deliveryDetails && (
              <Text className="text-xs text-gray-500 m-0 ml-4">
                └ {deliveryDetails}
              </Text>
            )}
          </>
        )}
      </Section>

      <Section className="mb-6">
        <Heading as="h3" className="text-lg font-bold text-[#367D5E] mb-2">
          Estimate
        </Heading>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-black text-white">
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-center">Qty</th>
              <th className="p-2 text-center">Size</th>
              <th className="p-2 text-center">Delivery</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-gray-300">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{item.name}</td>
                <td className="p-2 text-center">{item.quantity}</td>
                <td className="p-2 text-center">{item.size}</td>
                <td className="p-2 text-center">
                  {item.delivery ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="p-2 text-right font-bold">
                Sub Total:
              </td>
              <td className="p-2 text-right">{formatCAD(subTotal)}</td>
            </tr>
            <tr>
              <td colSpan={4} className="p-2 text-right font-bold">
                Tax:
              </td>
              <td className="p-2 text-right">{formatCAD(tax)}</td>
            </tr>
            <tr>
              <td colSpan={4} className="p-2 text-right font-extrabold text-lg">
                Total:
              </td>
              <td className="p-2 text-right font-extrabold text-lg">
                {formatCAD(quotationTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </Section>

      <Section className="mb-6">
        <Text className="text-base text-gray-700 m-0">
          You can download <strong>the full PDF estimate</strong> here:
        </Text>
        <Link
          href={pdfLink}
          className="text-[#367D5E] font-bold underline flex items-center"
        >
          ⬇ [Download Estimate PDF]
        </Link>
      </Section>

      <Section className="mb-8">
        <Heading as="h3" className="text-lg font-bold text-gray-900 mb-2">
          Next Step:
        </Heading>
        <Text className="text-base text-gray-700 mb-4">
          To{" "}
          <span className="font-bold">
            **confirm your booking and proceed with payment**
          </span>
          , please click the button below. Please respond/take action within{" "}
          <span className="text-red-600 font-bold">**48 hours**</span> to secure
          your booking.
          <br />
          If we don't hear from you, your request may be{" "}
          <strong>cancelled automatically</strong>.
          <br />
          If you need to <strong>make changes</strong> to this estimate or any
          detail, please call us{" "}
          <Link href={`tel: 111 (222) 3333`} className="underline">
            111 (222) 3333
          </Link>{" "}
          or send us an email.
        </Text>

        <Button
          href={bookingLink}
          className="bg-[#367D5E] text-white font-bold py-3 px-6 rounded-md text-base w-full text-center block"
          style={{ maxWidth: "250px" }}
        >
          Confirm Booking
        </Button>
      </Section>
    </Layout>
  );
};

export default QuotationSentCustomer;
