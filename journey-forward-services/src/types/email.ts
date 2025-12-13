export interface ItemData {
    name: string;
    size: string;
    quantity: number;
    price?: number;
    delivery?: boolean;
}

export interface CustomerData {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
}

export interface RequestData {
    requestId: number | string;
    preferredDatetime: Date | string;
    pickupAddress: string;
    deliveryAddress?: string | null;

    pickupFloor?: string | number | null;
    pickupElevator?: boolean | null;

    deliveryFloor?: string | number | null;
    deliveryElevator?: boolean | null;

    status: any;
    items?: ItemData[];
    deliveryRequired?: boolean;
}

export interface BookingReceivedProps {
    customer: CustomerData;
    request: RequestData;
    requestDate: string;
}

export interface QuotationSentProps extends BookingReceivedProps {
    quotationTotal: number;
    bookingLink: string;
    subTotal: number;
    tax: number;
    discountAmount?: number;
    pdfLink: string;
    items: (ItemData & { price: number; delivery: boolean })[];
}

export interface BookingConfirmedProps extends BookingReceivedProps {
    cancellationDeadline: string;
    quotation: {
        subtotal: number;
        tax: number;
        total: number;
        discountAmount?: number;
    };
    pdfLink?: string;
    manageLink?: string;
}

export interface AdminBookingConfirmedProps extends BookingReceivedProps {
    customerPhone: string;
    quotationTotal: number;
    subTotal?: number;
    discountAmount?: number;
    dashboardLink?: string;
}

export interface PaymentConfirmedCustomerProps extends BookingReceivedProps {
    finalTotal: number;
    subTotal?: number;
    tax?: number;
    discountAmount?: number;
}

export interface PaymentConfirmedAdminProps extends BookingReceivedProps {
    finalTotal: number;
    dashboardLink: string;
    subTotal?: number;
    discountAmount?: number;
}