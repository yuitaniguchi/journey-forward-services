// src/types/booking.ts
import type { RequestStatus } from "@prisma/client";

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
};

export type BookingPayment = {
  id: number;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: string;
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
  pickupFloor: number | null;
  pickupElevator: boolean | null;

  deliveryPostalCode: string | null;
  deliveryAddressLine1: string | null;
  deliveryAddressLine2: string | null;
  deliveryCity: string | null;
  deliveryState: string | null;
  deliveryFloor: number | null;
  deliveryElevator: boolean | null;

  preferredDatetime: string; // ISO 文字列
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
