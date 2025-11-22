"use client";

import * as React from "react";
import Link from "next/link";
import type { Event } from "@/types";

interface HeaderMarqueeProps {
  events: Event[];
}

export function HeaderMarquee({ events }: HeaderMarqueeProps) {
  const [isPaused, setIsPaused] = React.useState(false);

  if (!events || events.length === 0) {
    return null;
  }

  // Format event date for display
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if event is today
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    // Check if event is tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }
    // Otherwise show date
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Duplicate events for seamless loop
  const duplicatedEvents = [...events, ...events];

  // Calculate animation duration based on number of events
  const animationDuration = Math.max(events.length * 6, 20); // Minimum 20s, 6s per event

  return (
    <div
      className="lg:hidden overflow-hidden flex-1 h-full flex items-center min-w-0 max-w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div
        className={`flex gap-4 sm:gap-6 whitespace-nowrap ${
          isPaused ? "animate-none" : "animate-marquee"
        }`}
        style={{
          animationDuration: isPaused ? "0s" : `${animationDuration}s`,
        }}
      >
        {duplicatedEvents.map((event, index) => (
          <Link
            key={`${event.id}-${index}`}
            href={`/events/${event.slug}`}
            className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium text-text hover:text-primary transition-colors flex-shrink-0 px-2"
          >
            <span className="text-primary font-semibold whitespace-nowrap">
              {formatEventDate(event.eventDate)}
            </span>
            <span className="text-text-light">•</span>
            <span className="truncate max-w-[150px] sm:max-w-[200px]">{event.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

