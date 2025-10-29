import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Format date
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(d);
}

// Format date and time
export function formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(d);
}

// Format currency
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD'
    }).format(amount);
}

// Calculate cancellation deadline
export function calculateCancellationDeadline(appointmentDate: Date, hours: number = 24): Date {
    const deadline = new Date(appointmentDate);
    deadline.setHours(deadline.getHours() - hours);
    return deadline;
}

// Check if free cancellation is available
export function canCancelFree(appointmentDate: Date): boolean {
    const deadline = calculateCancellationDeadline(appointmentDate);
    return new Date() < deadline;
}

// Validate booking date (must be at least X hours in the future)
export function isValidBookingDate(date: Date, minimumHours: number = 24): boolean {
    const minDate = new Date();
    minDate.setHours(minDate.getHours() + minimumHours);
    return date >= minDate;
}