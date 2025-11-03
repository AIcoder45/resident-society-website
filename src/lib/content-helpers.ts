/**
 * Content Management Helper Functions
 * Utility functions for content validation and formatting
 */

/**
 * Validates a news article object
 * @param article - News article to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateNews(article: {
  id?: string;
  title?: string;
  slug?: string;
  shortDescription?: string;
  content?: string;
  publishedAt?: string;
}): string[] {
  const errors: string[] = [];

  if (!article.title || article.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!article.slug || article.slug.trim().length === 0) {
    errors.push('Slug is required');
  } else if (!/^[a-z0-9-]+$/.test(article.slug)) {
    errors.push('Slug must be lowercase, alphanumeric, with hyphens only');
  }

  if (!article.shortDescription || article.shortDescription.trim().length === 0) {
    errors.push('Short description is required');
  }

  if (!article.content || article.content.trim().length === 0) {
    errors.push('Content is required');
  }

  if (!article.publishedAt) {
    errors.push('Published date is required');
  } else if (isNaN(Date.parse(article.publishedAt))) {
    errors.push('Published date must be a valid ISO 8601 date');
  }

  return errors;
}

/**
 * Validates an event object
 * @param event - Event to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateEvent(event: {
  id?: string;
  title?: string;
  slug?: string;
  eventDate?: string;
  location?: string;
}): string[] {
  const errors: string[] = [];

  if (!event.title || event.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!event.slug || event.slug.trim().length === 0) {
    errors.push('Slug is required');
  }

  if (!event.eventDate) {
    errors.push('Event date is required');
  } else if (isNaN(Date.parse(event.eventDate))) {
    errors.push('Event date must be a valid ISO 8601 date');
  }

  if (!event.location || event.location.trim().length === 0) {
    errors.push('Location is required');
  }

  return errors;
}

/**
 * Generates a URL-friendly slug from a title
 * @param title - Title to convert to slug
 * @returns URL-friendly slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Formats a date string to ISO 8601 format
 * @param date - Date string or Date object
 * @returns ISO 8601 formatted date string
 */
export function formatDateISO(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
}

/**
 * Checks if a notification is expired
 * @param notification - Notification object
 * @returns True if notification is expired
 */
export function isNotificationExpired(notification: {
  expiryDate?: string | null;
}): boolean {
  if (!notification.expiryDate) return false;
  const expiry = new Date(notification.expiryDate);
  return expiry < new Date();
}

/**
 * Gets the next available ID from an array of items
 * @param items - Array of items with id property
 * @returns Next available ID as string
 */
export function getNextId(items: Array<{ id: string }>): string {
  if (items.length === 0) return '1';
  const maxId = Math.max(
    ...items.map((item) => parseInt(item.id, 10) || 0),
  );
  return (maxId + 1).toString();
}

