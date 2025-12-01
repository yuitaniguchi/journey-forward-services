import { Text, Heading, Section, Hr, Link } from "@react-email/components";
import * as React from "react";
import { LayoutAdmin } from "./components/LayoutAdmin";
import { AdminBookingConfirmedProps } from "../types/email";

export const BookingConfirmedAdmin: React.FC<AdminBookingConfirmedProps> = ({
  customer,
  request,
  requestDate,
  quotationTotal,
  customerPhone,
}) => {
  const previewText = `Booking Confirmed – Request #${request.requestId} from ${customer.lastName}`;
  const formattedTotal = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(quotationTotal);

  return (
    <LayoutAdmin previewText={previewText}>
      <Heading className="text-3xl font-bold text-red-700 my-4 text-center">
        Booking Confirmed
      </Heading>

      <Text className="text-base text-gray-800 text-center my-2">
        A customer has <strong>confirmed their booking</strong> for the request
        below.
      </Text>

      <Section className="bg-gray-50 p-5 mt-6 border border-gray-200 rounded-lg">
        <Text className="text-lg font-semibold text-gray-900 mb-2">
          Booking Summary
        </Text>

        <Hr className="border-gray-200 my-2" />

        <Text className="text-sm text-gray-700 leading-6">
          <span className="font-semibold">Request Number:</span>{" "}
          {request.requestId}
          <br />
          <span className="font-semibold">Customer Name:</span>{" "}
          {customer.firstName} {customer.lastName}
          <br />
          <span className="font-semibold">Phone:</span> {customerPhone}
          <br />
          <span className="font-semibold">Email:</span> {customer.email}
          <br />
          <span className="font-semibold">Service Date & Time:</span>{" "}
          {requestDate}
          <br />
          <span className="font-semibold">Estimated Total:</span>{" "}
          {formattedTotal}
        </Text>
      </Section>

      <Section className="text-center mt-6">
        <Link
          href={`/admin/requests/${request.requestId}`}
          className="inline-block bg-blue-600 text-white font-semibold text-base py-2 px-4 rounded transition-colors"
        >
          View Booking in Admin Dashboard
        </Link>
      </Section>
    </LayoutAdmin>
  );
};

export default BookingConfirmedAdmin;
