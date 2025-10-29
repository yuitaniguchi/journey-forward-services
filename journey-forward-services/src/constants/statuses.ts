import { RequestStatus } from '@/types/booking';

export const STATUS_LABELS: Record<RequestStatus, string> = {
    received: 'Received',
    quoted: 'Quoted',
    confirmed: 'Confirmed',
    invoiced: 'Invoiced',
    paid: 'Paid',
    cancelled: 'Cancelled'
};

export const STATUS_COLORS: Record<RequestStatus, string> = {
    received: 'bg-blue-100 text-blue-800',
    quoted: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    invoiced: 'bg-purple-100 text-purple-800',
    paid: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800'
};

export const STATUS_FLOW: Record<RequestStatus, RequestStatus[]> = {
    received: ['quoted', 'cancelled'],
    quoted: ['confirmed', 'cancelled'],
    confirmed: ['invoiced', 'cancelled'],
    invoiced: ['paid'],
    paid: [],
    cancelled: []
};