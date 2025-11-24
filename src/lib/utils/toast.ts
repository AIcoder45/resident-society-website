/**
 * Toast notification utility
 * Provides easy-to-use functions for showing toast notifications
 * All toasts automatically disappear after 5 seconds
 */

import { toast as sonnerToast } from "sonner";

/**
 * Show a success toast notification
 * @param message - The message to display
 * @param description - Optional description text
 */
export function toastSuccess(message: string, description?: string): void {
  sonnerToast.success(message, {
    description,
    duration: 5000,
  });
}

/**
 * Show an error toast notification
 * @param message - The message to display
 * @param description - Optional description text
 */
export function toastError(message: string, description?: string): void {
  sonnerToast.error(message, {
    description,
    duration: 5000,
  });
}

/**
 * Show an info toast notification
 * @param message - The message to display
 * @param description - Optional description text
 */
export function toastInfo(message: string, description?: string): void {
  sonnerToast.info(message, {
    description,
    duration: 5000,
  });
}

/**
 * Show a warning toast notification
 * @param message - The message to display
 * @param description - Optional description text
 */
export function toastWarning(message: string, description?: string): void {
  sonnerToast.warning(message, {
    description,
    duration: 5000,
  });
}

/**
 * Show a loading toast notification
 * @param message - The message to display
 * @returns A function to update or dismiss the toast
 */
export function toastLoading(message: string): (message?: string) => void {
  return sonnerToast.loading(message, {
    duration: Infinity, // Loading toasts don't auto-dismiss
  });
}

/**
 * Show a promise toast notification
 * @param promise - The promise to track
 * @param messages - Messages for loading, success, and error states
 */
export function toastPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  }
): Promise<T> {
  return sonnerToast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    duration: 5000,
  });
}

// Re-export the main toast function for custom usage
export { sonnerToast as toast };

