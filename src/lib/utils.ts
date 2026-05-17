import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('my-MM').format(price);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('my-MM', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
