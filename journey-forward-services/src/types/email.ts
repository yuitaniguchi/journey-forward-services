// types/email.ts

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
    // ⬇️ 追加: これがないとエラーになる可能性あり
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
    minimumFee: number;
    pdfLink: string;
    items: (ItemData & { price: number; delivery: boolean })[];
}

// ⬇️ ここを大幅修正！コンポーネントの要求に合わせます
export interface BookingConfirmedProps extends BookingReceivedProps {
    cancellationDeadline: string;
    // quotationTotal (number) ではなく、詳細オブジェクトにする
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