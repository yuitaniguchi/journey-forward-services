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
    requestId: number;
    preferredDatetime: Date;
    pickupAddress: string;
    deliveryAddress?: string;
    pickupFloor?: number;
    pickupElevator?: boolean;
    status: string;
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
    pdfLink: string;
    items: (ItemData & { price: number; delivery: boolean })[];
}

export interface BookingConfirmedProps extends BookingReceivedProps {
    cancellationDeadline: string;
    quotation: {
        subtotal: number;
        tax: number;
        total: number;
    };
}

export interface AdminBookingConfirmedProps extends BookingReceivedProps {
    customerPhone: string;
    quotationTotal: number;
}