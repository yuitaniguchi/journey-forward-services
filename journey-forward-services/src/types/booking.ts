import type { RequestStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export type BookingCustomer = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
};

export type BookingItem = {
  id: number;
  name: string;
  description: string | null;
  size: string;
  quantity: number;
  photoUrl: string | null;
};

export type BookingQuotation = {
  id: number;
  subtotal: number;
  tax: number;
  total: number;
  bookingLink: string;
  discountAmount?: Decimal | number | null;
  discountCodeId?: number | null;
};

export type BookingPayment = {
  id: number;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: string;
  discountAmount?: Decimal | number | null;
  discountCodeId?: number | null;
};

export type BookingRequest = {
  id: number;
  customerId: number;
  deliveryRequired: boolean;

  pickupPostalCode: string;
  pickupAddressLine1: string;
  pickupAddressLine2: string | null;
  pickupCity: string;
  pickupState: string;
  pickupFloor: string | null;
  pickupElevator: boolean | null;

  deliveryPostalCode: string | null;
  deliveryAddressLine1: string | null;
  deliveryAddressLine2: string | null;
  deliveryCity: string | null;
  deliveryState: string | null;
  deliveryFloor: string | null;
  deliveryElevator: boolean | null;

  preferredDatetime: string;
  status: RequestStatus;

  freeCancellationDeadline: string;
  cancelledAt: string | null;
  cancellationFee: number | null;

  createdAt: string;
  updatedAt: string;

  customer: BookingCustomer;
  items: BookingItem[];
  quotation: BookingQuotation | null;
  payment: BookingPayment | null;
};

export type BookingResponse = {
  data: BookingRequest;
};
