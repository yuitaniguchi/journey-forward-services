export type ServiceType = 'pickup' | 'pickup_delivery';

export type RequestStatus =
    | 'received'
    | 'quoted'
    | 'confirmed'
    | 'invoiced'
    | 'paid'
    | 'cancelled';

export interface Item {
    id?: string;
    name: string;
    size: 'small' | 'medium' | 'large';
    imageUrl?: string;
}

export interface BookingFormData {
    // Customer info
    name: string;
    email: string;
    phone: string;

    // Service details
    serviceType: ServiceType;
    address: string;
    city: string;
    floor?: string;
    hasElevator: boolean;
    preferredDate: Date;
    preferredTime: string;

    // Items
    items: Item[];

    // Notes
    notes?: string;
}

export interface Request {
    id: string;
    customerId: string;
    serviceType: ServiceType;
    address: string;
    city: string;
    floor?: string;
    hasElevator: boolean;
    preferredDate: Date;
    preferredTime: string;
    status: RequestStatus;
    quotedAmount?: number;
    finalAmount?: number;
    cancellationFee?: number;
    notes?: string;
    adminNotes?: string;
    createdAt: Date;
    updatedAt: Date;
    items: Item[];
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
}