import {
  Text,
  Heading,
  Section,
  Img,
  Link,
  Column,
  Row,
} from "@react-email/components";
import * as React from "react";
import { Layout } from "./components/Layout";
import { BookingConfirmedProps } from "../types/email";

const CONFIRM_IMAGE_URL =
  "https://res.cloudinary.com/doh9afvyd/image/upload/v1764549569/booking-confirmed_hopufe.png";

export const BookingConfirmedCustomer: React.FC<BookingConfirmedProps> = ({
  customer,
  request,
  requestDate,
  quotation,
  cancellationDeadline,
}) => {
  const previewText =
    "Thank you for your booking with Journey Forward Services!";

  const fullPickupAddress =
    request.pickupAddress +
    (request.deliveryAddress ? ` / ${request.deliveryAddress}` : "");

  const getOrdinalFloor = (floor: number): string => {
    const suffixes = ["th", "st", "nd", "rd"];
    const value = floor % 100;
    return (
      floor +
      (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]) +
      " floor"
    );
  };

  const pickupFloorInfo = (() => {
    const floorText =
      request.pickupFloor !== undefined && request.pickupFloor !== null
        ? getOrdinalFloor(request.pickupFloor)
        : null;

    const elevatorText =
      request.pickupElevator !== undefined
        ? request.pickupElevator
          ? "Elevator available"
          : "No elevator"
        : null;

    if (floorText && elevatorText) {
      return `${floorText}/${elevatorText}`;
    } else if (floorText) {
      return floorText;
    } else if (elevatorText) {
      return elevatorText;
    }
    return null;
  })();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  return (
    <Layout previewText={previewText}>
      <Section className="text-center">
        <Img
          src={CONFIRM_IMAGE_URL}
          width="70%"
          alt="Booking Confirmed"
          className="mx-auto"
        />
      </Section>

      <Heading className="text-2xl font-bold text-[#367D5E] my-4 text-left">
        Thank You for Booking with JFS!
      </Heading>

      <Heading className="text-lg font-bold text-gray-800 m-0 text-left">
        Request Number: {request.requestId}
      </Heading>

      <Text className="text-base my-6 text-left">Hi {customer.firstName},</Text>

      <Text className="text-base mt-4 text-left">
        Thank you for confirming your booking with Journey Forward Services
        (JFS). We're happy to help you move things forward – whether that's
        through donation or delivery.
      </Text>

      <Section className="mt-6 text-left">
        <Heading className="text-lg font-bold m-0">Booking Details:</Heading>

        <Text className="text-base m-0">
          <span className="font-bold text-[#367D5E]">Pickup Date:</span>{" "}
          {requestDate} <br />
          <span className="font-bold text-[#367D5E]">Pickup Address:</span>{" "}
          {fullPickupAddress} <br />
          {pickupFloorInfo && (
            <>
              <span className="font-bold text-[#367D5E]">Other:</span>{" "}
              {pickupFloorInfo} <br />
            </>
          )}
        </Text>
      </Section>

      <Section className="mt-[30px] text-left">
        <Heading className="text-[20px] font-bold text-[#367D5E] mb-4">
          Estimate
        </Heading>

        <Text className="text-[16px] text-gray-800 mb-4">
          Minimum location fee: $50
        </Text>

        <Section className="w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black text-white text-left text-[14px]">
                <th className="p-2 font-normal">#</th>
                <th className="p-2 font-normal">Item</th>
                <th className="p-2 font-normal text-center">Qty</th>
                <th className="p-2 font-normal text-center">Size</th>
                <th className="p-2 font-normal text-center">Delivery</th>
              </tr>
            </thead>
            <tbody>
              {request.items && request.items.length > 0 ? (
                request.items.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-300 text-[14px]"
                  >
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2 text-center">{item.quantity}</td>
                    <td className="p-2 text-center">{item.size}</td>
                    <td className="p-2 text-center">
                      {request.deliveryRequired ? "Yes" : "No"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-2 text-center text-gray-500">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Section>

        <Section className="mt-4 text-right text-[14px]">
          <Row>
            <Column className="w-2/3"></Column>
            <Column>
              <Text className="m-0 font-bold">Sub Total:</Text>
              <Text className="m-0 font-bold">Tax:</Text>
              <Text className="m-0 font-bold text-[18px]">Total:</Text>
            </Column>
            <Column className="text-right">
              <Text className="m-0 font-bold">
                {formatCurrency(quotation.subtotal)}
              </Text>
              <Text className="m-0 font-bold">
                {formatCurrency(quotation.tax)}
              </Text>
              <Text className="m-0 font-bold text-[18px]">
                {formatCurrency(quotation.total)}
              </Text>
            </Column>
          </Row>
        </Section>
      </Section>

      <Section className="mt-[30px] text-left">
        <Text className="text-[16px] text-gray-700 m-0">
          You can download the full PDF estimate here:
        </Text>
        <Link
          href="#"
          className="text-[16px] text-blue-600 underline font-bold flex items-center mt-[5px]"
        >
          ⬇ [Download Estimate PDF Button or Link]
        </Link>
      </Section>

      <Section className="mt-6 text-left">
        <Heading className="text-base font-bold m-0">
          When Will You Be Charged?
        </Heading>
        <Text className="text-base m-0">
          Your payment will only be processed after the service is completed,
          once we issue the final invoice. You'll receive an email with the full
          breakdown before the charge is made.
        </Text>
      </Section>

      <Section className="mt-4 text-left">
        <Heading className="text-[18px] font-bold m-0">
          Cancellation Policy
        </Heading>

        <Text className="text-base m-0">
          To <span className="font-bold">**cancel the booking**</span>, please
          click the button below or contact us. We understand that plans may
          change. Here's how cancellations work:
        </Text>
        <ul className="text-base m-0 pl-5">
          <li>
            <span className="font-bold">Free cancellation</span> is available up
            to <span className="text-[#E04F4F] font-bold">24 hours before</span>{" "}
            your scheduled pick-up time.
          </li>
          <li>
            If you cancel within 24 hours of the scheduled pick-up,{" "}
            <span className="font-bold">a cancellation fee of $25</span> will be
            charged to your registered credit card.
          </li>
        </ul>
        <Text className="text-base font-bold text-[#E04F4F] mt-6 m">
          Free cancelation up to {cancellationDeadline}
        </Text>
      </Section>

      <Section className="mt-6 text-left">
        <Link
          href={`/booking-management/${request.requestId}`}
          className="bg-[#367D5E] text-white px-4 py-4 rounded-md text-base font-semibold inline-block"
          style={{ textDecoration: "none" }}
        >
          View/Manage Booking
        </Link>
      </Section>
    </Layout>
  );
};

export default BookingConfirmedCustomer;
