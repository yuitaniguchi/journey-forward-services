import { Text, Heading, Section, Img, Link } from "@react-email/components";
import * as React from "react";
import { Layout } from "./components/Layout";
import { BookingReceivedProps } from "../types/email";

const HERO_IMAGE_URL =
  "https://res.cloudinary.com/doh9afvyd/image/upload/v1764549494/auto-confirmation_cnqpmn.png";

export const AutoConfirmationCustomer: React.FC<BookingReceivedProps> = ({
  customer,
  request,
  requestDate,
}) => {
  const previewText = "We've received your quote request.";

  const itemSummary =
    request.items && request.items.length > 0
      ? request.items
          .map((item) => `${item.name} (${item.size}) x ${item.quantity}`)
          .join(", ")
      : "No items";

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
    elevator?: boolean
  ) => {
    const floorText = getFloorDisplay(floor);
    const elevatorText =
      elevator !== undefined
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

  const pickupFloorInfo = getDetailsString(
    request.pickupFloor,
    request.pickupElevator
  );
  const deliveryFloorInfo = getDetailsString(
    (request as any).deliveryFloor,
    (request as any).deliveryElevator
  );

  return (
    <Layout previewText={previewText}>
      <Section className="text-center">
        <Img src={HERO_IMAGE_URL} width="70%" alt="Your Estimate is coming!" />
      </Section>

      <Heading className="text-2xl font-bold text-[#367D5E] my-6">
        Your Estimate is coming!
      </Heading>

      <Text className="text-lg font-bold m-0">
        Request Number: {request.requestId}
      </Text>

      <Text className="text-base mt-4">Hi {customer.firstName},</Text>

      <Text className="text-base mt-4">
        Thank you for submitting your pick-up request through Journey Forward
        Services.
      </Text>

      <Section className="mt-6">
        <Text className="text-base font-bold m-0">
          We've successfully received the following details:
        </Text>

        <Text className="text-sm leading-6 m-0">
          <span className="font-semibold text-[#367D5E]">Pickup Date:</span>{" "}
          {requestDate} <br />
          <span className="font-semibold text-[#367D5E]">
            Pickup address:
          </span>{" "}
          {request.pickupAddress} <br />
          {pickupFloorInfo && (
            <span className="text-gray-600 text-xs pl-2">
              └ Details: {pickupFloorInfo} <br />
            </span>
          )}
          {request.deliveryAddress && (
            <>
              <span className="font-semibold text-[#367D5E]">
                Delivery address:
              </span>{" "}
              {request.deliveryAddress} <br />
              {deliveryFloorInfo && (
                <span className="text-gray-600 text-xs pl-2">
                  └ Details: {deliveryFloorInfo} <br />
                </span>
              )}
            </>
          )}
          <span className="font-semibold text-[#367D5E]">
            Number and types of items:
          </span>{" "}
          {itemSummary} <br />
        </Text>
      </Section>

      <Section className="mt-6">
        <Text className="text-base font-bold m-0">What happens next:</Text>
        <Text className="text-sm m-0">
          Our team will review the details you submitted and send you an
          <span className="text-red-500 font-bold">
            {" "}
            **accurate estimate**
          </span>{" "}
          within 24-48 hours.
        </Text>

        <Text className="text-sm mt-6 mb-0 mx-0">
          <span className="font-bold">Please note:</span>
          <br />
          <span className="text-red-500 font-bold">
            **Your booking will only be confirmed once you review and approve
            the estimate.**
          </span>
          <br />
          After your confirmation, we will send you a payment link to complete
          the process.
        </Text>
      </Section>
    </Layout>
  );
};

export default AutoConfirmationCustomer;
