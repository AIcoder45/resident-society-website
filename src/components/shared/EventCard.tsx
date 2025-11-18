"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";

export interface EventCardProps {
  event: Event;
  className?: string;
}

/**
 * Specialized card component for events
 * Displays event date, location, and cover image
 */
export function EventCard({ event, className }: EventCardProps) {
  const eventDate = new Date(event.eventDate);
  const isUpcoming = eventDate >= new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className={cn("w-full min-w-0", className)}
    >
      <Link href={`/events/${event.slug}`} className="block h-full w-full touch-manipulation tap-feedback">
        <Card className="h-full w-full transition-all hover:shadow-lg overflow-hidden">
          {event.coverImage && (
            <div className="relative w-full h-52 sm:h-48 overflow-hidden rounded-t-lg">
              <Image
                src={event.coverImage}
                alt={event.title}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
                unoptimized={event.coverImage.startsWith("/") && !event.coverImage.startsWith("http")}
              />
              {isUpcoming && (
                <div
                  className="absolute top-2 right-2 md:top-3 md:right-3 bg-primary text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-lg z-10"
                  aria-label="Upcoming event"
                >
                  Upcoming
                </div>
              )}
            </div>
          )}
          <CardHeader>
            <CardTitle className="line-clamp-2">{event.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-text-light">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{formatDate(event.eventDate, "long")}</span>
                </div>
                {event.location && (
                <div className="flex items-center gap-2 text-sm text-text-light">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
