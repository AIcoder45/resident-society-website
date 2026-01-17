"use client";

import * as React from "react";
import { Users, Home, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface EventInterest {
  id: number | string;
  eventId?: string;
  houseNumber: string;
  floorNumber: string;
  residentName?: string | null;
  attendeeCount: number;
  contactNumber?: string | null;
  notes?: string | null;
  interested?: string;
  registeredAt?: string;
  updatedAt?: string;
}

export interface EventAnalyticsProps {
  eventId: string;
}

interface AnalyticsData {
  totalAttendees: number;
  totalRegistrations: number;
  averageAttendeesPerHouse: string;
  byFloor: Record<string, { count: number; attendees: number }>;
  registrations: EventInterest[];
}

/**
 * Component to display event attendance analytics
 * Shows total attendees, breakdown by floor, and list of registrations
 */
export function EventAnalytics({ eventId }: EventAnalyticsProps) {
  const [analytics, setAnalytics] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError("");

        const apiUrl = `/api/event-interests/event/${eventId}`;
        
        // Log in production for debugging
        if (process.env.NODE_ENV === "production") {
          console.log("[EventAnalytics] Fetching:", apiUrl);
        }

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // Don't cache in production to ensure fresh data
          cache: "no-store",
        });

        // Check if response is ok before parsing JSON
        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText || `HTTP ${response.status}` };
          }
          
          const errorMessage = errorData.error || `Failed to fetch analytics (${response.status})`;
          console.error("[EventAnalytics] API Error:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
            url: apiUrl,
          });
          throw new Error(errorMessage);
        }

        const result = await response.json();

        if (!result.success) {
          const errorMessage = result.error || "Failed to fetch analytics";
          console.error("[EventAnalytics] Response error:", result);
          throw new Error(errorMessage);
        }

        // Handle Strapi custom endpoint response structure
        // Response format: { data: { event: {...}, interests: [...], summary: {...} } }
        const responseData = result.data || {
          event: null,
          interests: [],
          summary: {
            totalHouses: 0,
            totalAttendees: 0,
            averageAttendeesPerHouse: "0",
          },
        };

        // Map interests array to EventInterest format
        // Each interest object has: id, eventId, event, houseNumber, floorNumber, etc.
        const interests: EventInterest[] = (responseData.interests || []).map((item: any) => ({
          id: item.id || item.id?.toString() || "",
          eventId: item.eventId || item.event?.id?.toString() || "",
          houseNumber: item.houseNumber || item.houseNo || "",
          floorNumber: item.floorNumber || item.floorNo || "",
          residentName: item.residentName || item.name || null,
          attendeeCount: item.numberOfMembers || item.attendeeCount || 0,
          contactNumber: item.contactNumber || item.mobileNo || null,
          notes: item.notes || null,
          interested: item.interested || (item.showInterest ? "yes" : "no") || "yes",
          registeredAt: item.registeredAt || item.createdAt || undefined,
          updatedAt: item.updatedAt || undefined,
        }));

        // Use summary from API response
        // Summary format: { totalHouses, totalAttendees, totalMembers, averageAttendeesPerHouse }
        const summary = responseData.summary || {
          totalHouses: 0,
          totalAttendees: 0,
          totalMembers: 0,
          averageAttendeesPerHouse: "0",
        };

        // Use API summary values, prefer totalMembers if available, fallback to calculated if needed
        const totalAttendees = summary.totalMembers ?? summary.totalAttendees ?? interests.reduce((sum, item) => sum + (item.attendeeCount || 0), 0);
        const totalRegistrations = summary.totalHouses ?? interests.length;

        // Group by floor
        const byFloor: Record<string, { count: number; attendees: number }> = {};
        interests.forEach((item) => {
          const floor = item.floorNumber || "Unknown";
          if (!byFloor[floor]) {
            byFloor[floor] = { count: 0, attendees: 0 };
          }
          byFloor[floor].count += 1;
          byFloor[floor].attendees += item.attendeeCount || 0;
        });

        setAnalytics({
          totalAttendees,
          totalRegistrations,
          averageAttendeesPerHouse: summary.averageAttendeesPerHouse || "0",
          byFloor,
          registrations: interests,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load analytics";
        console.error("[EventAnalytics] Error:", {
          error: errorMessage,
          eventId,
          details: err,
        });
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      fetchAnalytics();
    }

    // Listen for refresh events
    const handleRefresh = (e: CustomEvent) => {
      if (e.detail?.eventId === eventId || !e.detail?.eventId) {
        fetchAnalytics();
      }
    };

    window.addEventListener("eventInterestUpdated" as any, handleRefresh as EventListener);
    
    return () => {
      window.removeEventListener("eventInterestUpdated" as any, handleRefresh as EventListener);
    };
  }, [eventId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-xs sm:text-sm text-text-light">Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-red-800">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show component even if no registrations (don't hide it)
  if (!analytics) {
    return null; // Still loading or error state handled above
  }

  if (analytics.totalRegistrations === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Event Attendance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-primary/10 rounded-lg p-2 sm:p-3 border border-primary/20">
              <div className="flex items-center gap-1 mb-1">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span className="text-xs font-medium text-text">Total Members</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-primary">0</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-200">
              <div className="flex items-center gap-1 mb-1">
                <Home className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                <span className="text-xs font-medium text-text">Houses</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-blue-600">0</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-text-light text-center py-3 mt-3">
            No registrations yet. Be the first to mark your availability!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Event Attendance Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats - Compact */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-primary/10 rounded-lg p-2 sm:p-3 border border-primary/20">
            <div className="flex items-center gap-1 mb-1">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span className="text-xs font-medium text-text">Total Members</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-primary">
              {analytics.totalAttendees}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-200">
            <div className="flex items-center gap-1 mb-1">
              <Home className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              <span className="text-xs font-medium text-text">Houses</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-blue-600">
              {analytics.totalRegistrations}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

