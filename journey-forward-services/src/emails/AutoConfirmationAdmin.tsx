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

interface AutoConfirmationAdminProps extends BookingReceivedProps {
  dashboardLink: string;
}

export const AutoConfirmationAdmin: React.FC<AutoConfirmationAdminProps> = ({
  customer,
  request,
  dashboardLink,
  requestDate,
}) => {
  const previewText = `[New Request] #${request?.requestId} from ${customer?.firstName} ${customer?.lastName}`;

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
    const parts = [];
    const floorStr = getFloorDisplay(floor);

    if (floorStr) parts.push(floorStr);
    if (elevator !== undefined && elevator !== null)
      parts.push(elevator ? "Elevator: Yes" : "Elevator: No");

    return parts.length > 0 ? parts.join(", ") : "None";
  };

  const pickupDetails = getDetailsString(
    request.pickupFloor,
    request.pickupElevator
  );
  const deliveryDetails = getDetailsString(
    (request as any).deliveryFloor,
    (request as any).deliveryElevator
  );

  return (
    <LayoutAdmin previewText={previewText}>
      <Heading className="text-xl font-bold text-blue-600 my-6">
        New Booking Request Received
      </Heading>

      <Text className="text-base text-gray-700">
        A new booking request has been submitted via the website.
        <br />
        Please review the details and create a quotation.
      </Text>

      <Section className="bg-gray-100 p-4 rounded-md border border-gray-300 mb-6">
        <Row>
          <Column>
            <Text className="text-xs text-gray-500 m-0 uppercase font-bold">
              Request ID
            </Text>
            <Text className="text-lg font-bold text-gray-800 m-0">
              #{request?.requestId}
            </Text>
          </Column>
          <Column>
            <Text className="text-xs text-gray-500 m-0 uppercase font-bold">
              Preferred Date
            </Text>
            <Text className="text-lg font-bold text-gray-800 m-0">
              {request?.preferredDatetime
                ? formatDateTime(request.preferredDatetime)
                : "Not specified"}
            </Text>
          </Column>
        </Row>
      </Section>

      <Section className="mb-6">
        <Heading
          as="h3"
          className="text-md font-bold text-gray-700 border-b border-gray-200 pb-2"
        >
          Customer Information
        </Heading>
        <Text className="text-sm text-gray-700 m-0 mt-2">
          <strong>Name:</strong> {customer?.firstName} {customer?.lastName}
        </Text>
        <Text className="text-sm text-gray-700 m-0">
          <strong>Email:</strong>{" "}
          <a
            href={`mailto:${customer?.email}`}
            className="text-blue-600 underline"
          >
            {customer?.email}
          </a>
        </Text>
        <Text className="text-sm text-gray-700 m-0">
          <strong>Phone:</strong>{" "}
          <a
            href={`tel:${customer?.phone}`}
            className="text-blue-600 underline"
          >
            {customer?.phone}
          </a>
        </Text>
      </Section>

      <Section className="mb-6">
        <Heading
          as="h3"
          className="text-md font-bold text-gray-700 border-b border-gray-200 pb-2"
        >
          Location Details
        </Heading>

        {/* Pickup Info */}
        <div style={{ marginBottom: "10px" }}>
          <Text className="text-sm text-gray-700 m-0 mt-2">
            <strong>Pickup:</strong> {request?.pickupAddress}
          </Text>
          <Text className="text-xs text-gray-500 m-0 ml-2">
            └ {pickupDetails}
          </Text>
        </div>

        {/* Delivery Info */}
        {request?.deliveryAddress && (
          <div style={{ marginBottom: "10px" }}>
            <Text className="text-sm text-gray-700 m-0 mt-2">
              <strong>Delivery:</strong> {request.deliveryAddress}
            </Text>
            <Text className="text-xs text-gray-500 m-0 ml-2">
              └ {deliveryDetails}
            </Text>
          </div>
        )}
      </Section>

      <Section className="mb-8">
        <Heading
          as="h3"
          className="text-md font-bold text-gray-700 border-b border-gray-200 pb-2"
        >
          Items
        </Heading>
        {request?.items && request.items.length > 0 ? (
          <ul style={{ paddingLeft: "20px", margin: "10px 0" }}>
            {request.items.map((item, index) => (
              <li key={index} style={{ fontSize: "14px", color: "#374151" }}>
                {item.name} (Qty: {item.quantity}, Size: {item.size})
              </li>
            ))}
          </ul>
        ) : (
          <Text className="text-sm text-gray-500 italic">No items listed.</Text>
        )}
      </Section>

      <Section className="text-center mt-8 mb-4">
        <Button
          href={dashboardLink}
          className="bg-blue-600 text-white font-bold py-3 px-6 rounded-md text-sm"
        >
          Create Quotation in Dashboard
        </Button>
      </Section>

      <Hr className="border-gray-200 my-4" />
      <Text className="text-xs text-gray-500 text-center">
        New Request Notification - ManageSmartr
      </Text>
    </LayoutAdmin>
  );
};

export default AutoConfirmationAdmin;
