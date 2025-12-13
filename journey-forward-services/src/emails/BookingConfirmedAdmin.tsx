import { Text, Heading, Section, Hr, Button } from "@react-email/components";
import * as React from "react";
import { LayoutAdmin } from "./components/LayoutAdmin";
import { AdminBookingConfirmedProps } from "../types/email";

interface ExtendedAdminBookingConfirmedProps
  extends AdminBookingConfirmedProps {
  dashboardLink: string;
  subTotal?: number;
  discountAmount?: number;
}

export const BookingConfirmedAdmin: React.FC<
  ExtendedAdminBookingConfirmedProps
> = ({
  customer,
  request,
  requestDate,
  quotationTotal,
  customerPhone,
  dashboardLink,
  discountAmount,
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
          <br />
          <span className="font-semibold">Estimated Total:</span>{" "}
          {formattedTotal}
          {discountAmount !== undefined && discountAmount > 0 && (
            <span className="text-red-600 font-semibold ml-2">
              (Includes discount: -
              {new Intl.NumberFormat("en-CA", {
                style: "currency",
                currency: "CAD",
              }).format(discountAmount)}
              )
            </span>
          )}
        </Text>
      </Section>

      <Section className="text-center mt-6">
        <Button
          href={dashboardLink}
          className="bg-blue-600 text-white font-bold py-3 px-6 rounded-md text-sm"
        >
          View Booking in Admin Dashboard
        </Button>
      </Section>
    </LayoutAdmin>
  );
};

export default BookingConfirmedAdmin;
