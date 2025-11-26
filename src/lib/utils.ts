import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes a date to start of day (midnight) for consistent comparisons
 * @param date - Date string or Date object
 * @returns Date object normalized to start of day
 */
export function normalizeDateToStartOfDay(date: string | Date): Date {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const normalized = new Date(dateObj);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Checks if an event date is upcoming (today or future)
 * @param eventDate - Event date string or Date object
 * @returns true if event is upcoming, false otherwise
 */
export function isEventUpcoming(eventDate: string | Date): boolean {
  const eventDateNormalized = normalizeDateToStartOfDay(eventDate);
  const todayNormalized = normalizeDateToStartOfDay(new Date());
  return eventDateNormalized >= todayNormalized;
}

/**
 * Formats a date to a readable string
 * @param date - Date string or Date object
 * @param format - Format type ('short' | 'long' | 'relative')
 * @returns Formatted date string or empty string if invalid
 *
 * NOTE:
 * We explicitly format using the "Asia/Kolkata" timezone so that
 * server-side rendering (which typically runs in UTC) and client-side
 * rendering are consistent and do not show the date one day earlier.
 */
export function formatDate(
  date: string | Date | null | undefined,
  format: "short" | "long" | "relative" = "short",
): string {
  // Handle null/undefined
  if (!date) {
    return "";
  }

  // Create date object
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Validate date
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    console.warn("Invalid date passed to formatDate:", date);
    return "";
  }

  if (format === "relative") {
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  }

  const timeZone = "Asia/Kolkata";

  if (format === "long") {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone,
    };
    return new Intl.DateTimeFormat("en-IN", options).format(dateObj);
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone,
  };
  return new Intl.DateTimeFormat("en-IN", options).format(dateObj);
}
