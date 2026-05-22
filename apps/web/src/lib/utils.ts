import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merges Tailwind class names, resolving conflicts correctly. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Formats a number as currency using the provided ISO currency code. */
export function formatCurrency(amount: number, currencyCode = 'USD'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}

/** Formats a Date as a short locale date-time string. */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

/** Generates a stable UUID v4 using the Web Crypto API. */
export function uuid(): string {
  return crypto.randomUUID();
}
