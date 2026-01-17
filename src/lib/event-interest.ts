/**
 * API utility for submitting event interest/availability
 * Uses Next.js API route which proxies to Strapi using STRAPI_URL
 */

import type { EventInterest } from "@/types";

export interface SubmitEventInterestResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface CheckEventInterestResponse {
  success: boolean;
  data?: {
    exists: boolean;
    interest?: {
      id: number;
      houseNo?: string;
      houseNumber?: string; // Support both for backward compatibility
      floorNo?: string;
      floorNumber?: string; // Support both for backward compatibility
      name?: string;
      residentName?: string; // Support both for backward compatibility
      mobileNo?: string;
      contactNumber?: string; // Support both for backward compatibility
      numberOfMembers?: number;
      attendeeCount?: number; // Support both for backward compatibility
      showInterest?: boolean;
      interested?: string; // Support both for backward compatibility
    } | null;
  };
  error?: string;
}

export interface EventSummaryResponse {
  success: boolean;
  data?: {
    eventId: number;
    eventTitle: string;
    eventDate: string | null;
    eventSlug: string;
    totalInterests: number;
    totalHouses: number;
    totalMembers: number; // Total number of members coming
  };
  error?: string;
}

export interface DeleteEventInterestResponse {
  success: boolean;
  data?: {
    id: number;
    deleted: boolean;
  };
  message?: string;
  error?: string;
}

/**
 * Check if event interest already exists for a given event, house number, and floor
 * @param eventId - Event ID
 * @param houseNumber - House number (with C- prefix)
 * @param floorNumber - Floor number
 * @returns Response with existence status and existing data if found
 */
export async function checkEventInterest(
  eventId: string | number,
  houseNumber: string,
  floorNumber: string
): Promise<CheckEventInterestResponse> {
  try {
    // Convert to new API format (houseNo, floorNo)
    const params = new URLSearchParams({
      eventId: String(eventId),
      houseNo: houseNumber,
      floorNo: floorNumber,
    });

    const response = await fetch(`/api/event-interests/check?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Failed to check availability: ${response.status} ${response.statusText}`,
      };
    }

    // Convert response back to old format for backward compatibility
    const responseData = data.data || { exists: false, interest: null };
    if (responseData.interest) {
      const interest = responseData.interest;
      responseData.interest = {
        ...interest,
        houseNumber: interest.houseNo || interest.houseNumber,
        floorNumber: interest.floorNo || interest.floorNumber,
        residentName: interest.name || interest.residentName,
        contactNumber: interest.mobileNo || interest.contactNumber,
        attendeeCount: interest.numberOfMembers || interest.attendeeCount || 1,
        interested: interest.showInterest !== undefined ? (interest.showInterest ? "yes" : "no") : interest.interested || "yes",
      };
    }

    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    console.error("Error checking event interest:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Network error. Please check your connection and try again.",
      data: { exists: false, interest: null },
    };
  }
}

/**
 * Submit event interest/availability via Next.js API route
 * The API route uses STRAPI_URL server-side
 * @param interestData - Event interest data (uses old field names)
 * @param existingId - Optional ID of existing interest to update
 * @returns Response with success status
 */
export async function submitEventInterest(
  interestData: EventInterest,
  existingId?: number | string
): Promise<SubmitEventInterestResponse> {
  try {
    // Convert from old format to new API format
    const requestBody = {
      data: {
        event: interestData.event,
        houseNo: interestData.houseNumber,
        floorNo: interestData.floorNumber,
        name: interestData.residentName || null,
        mobileNo: interestData.contactNumber || null,
        numberOfMembers: interestData.attendeeCount || 1,
        showInterest: interestData.interested === "yes",
      },
    };

    const endpoint = existingId
      ? `/api/event-interests/${existingId}`
      : "/api/event-interests";
    const method = existingId ? "PUT" : "POST";

    if (process.env.NODE_ENV === "development") {
      console.log("🔍 [EventInterest] Submitting via API route:", {
        endpoint,
        method,
        existingId,
      });
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Failed to ${existingId ? "update" : "submit"} availability: ${response.status} ${response.statusText}`,
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error("Error submitting event interest:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Network error. Please check your connection and try again.",
    };
  }
}

/**
 * Get event summary showing how many houses are joining
 * @param eventId - Event ID
 * @returns Response with summary data
 */
export async function getEventSummary(
  eventId: string | number
): Promise<EventSummaryResponse> {
  try {
    const response = await fetch(`/api/event-interests/event/${eventId}/summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Failed to fetch summary: ${response.status} ${response.statusText}`,
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error fetching event summary:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Network error. Please check your connection and try again.",
    };
  }
}

/**
 * Delete event interest
 * @param interestId - Interest ID to delete
 * @returns Response with success status
 */
export async function deleteEventInterest(
  interestId: number | string
): Promise<DeleteEventInterestResponse> {
  try {
    const response = await fetch(`/api/event-interests/${interestId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Failed to delete interest: ${response.status} ${response.statusText}`,
      };
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    console.error("Error deleting event interest:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Network error. Please check your connection and try again.",
    };
  }
}
