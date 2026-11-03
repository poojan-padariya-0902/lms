import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string safely and deterministically across SSR and browser.
 * Guarantees zero hydration mismatch between server UTC and client locale.
 */
export function formatDate(dateString?: string | Date | null): string {
  if (!dateString) return 'Recently';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toISOString().split('T')[0];
  } catch {
    return 'Recently';
  }
}

