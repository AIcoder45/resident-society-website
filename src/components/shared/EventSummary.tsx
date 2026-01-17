"use client";

import * as React from "react";
import { Users, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getEventSummary } from "@/lib/event-interest";

export interface EventSummaryProps {
  eventId: string;
}

/**
 * Component to display event summary showing how many houses are joining
 */
export function EventSummary({ eventId }: EventSummaryProps) {
  const [summary, setSummary] = React.useState<{
    totalHouses: number;
    totalInterests: number;
    eventTitle: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        setError("");

        const result = await getEventSummary(eventId);

        if (result.success && result.data) {
          setSummary({
            totalHouses: result.data.totalHouses || result.data.totalInterests || 0,
            totalInterests: result.data.totalInterests || 0,
            eventTitle: result.data.eventTitle || "",
          });
        } else {
          setError(result.error || "Failed to load summary");
        }
      } catch (err) {
        console.error("Error fetching event summary:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load summary"
        );
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      fetchSummary();
    }

    // Listen for refresh events
    const handleRefresh = (e: CustomEvent) => {
      if (e.detail?.eventId === eventId || !e.detail?.eventId) {
        fetchSummary();
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
          <div className="flex items-center gap-2 text-sm text-text-light">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Loading summary...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex-shrink-0">
            <div className="rounded-full bg-primary/10 p-2 sm:p-2.5">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm sm:text-base font-semibold text-text mb-0.5">
              Event Participation
            </h3>
            <p className="text-xs sm:text-sm text-text-light">
              <span className="font-bold text-primary text-base sm:text-lg">
                {summary.totalHouses}
              </span>{" "}
              {summary.totalHouses === 1 ? "house is" : "houses are"} joining this event
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
