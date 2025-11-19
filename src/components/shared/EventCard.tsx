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

/**
 * Limit text to approximately 30 words
 */
function limitWords(text: string, maxWords: number = 30): string {
  const words = text.split(" ");
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

export interface EventCardProps {
  event: Event;
  className?: string;
  compact?: boolean;
}

/**
 * Specialized card component for events
 * Displays event date, location, and cover image
 */
export function EventCard({ event, className, compact = false }: EventCardProps) {
  const eventDate = new Date(event.eventDate);
  const isUpcoming = eventDate >= new Date();
  const displayDescription = event.description ? limitWords(event.description, 30) : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className={cn("w-full min-w-0", className)}
    >
      <Link href={`/events/${event.slug}`} className="block h-full w-full touch-manipulation tap-feedback">
        <Card className="h-full w-full overflow-hidden active:scale-[0.98] sm:active:scale-100 bg-white border border-gray-200/60 rounded-xl transition-all duration-300 ease-out hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30 group cursor-pointer">
          {event.coverImage && (
            <div className={cn(
              "relative w-full overflow-hidden",
              compact ? "h-[72px] sm:h-[80px] md:h-[88px]" : "h-[96px] sm:h-[104px] md:h-[112px]",
              "bg-gradient-to-br from-gray-100 to-gray-200"
            )}>
              <Image
                src={event.coverImage}
                alt={event.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                loading="lazy"
                unoptimized={event.coverImage.startsWith("/") && !event.coverImage.startsWith("http")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {isUpcoming && (
                <div
                  className={cn(
                    "absolute top-1 right-1 bg-primary text-white rounded-md font-semibold shadow-lg z-10 backdrop-blur-sm",
                    compact ? "px-1 py-0.5 text-[8px]" : "px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px]"
                  )}
                  aria-label="Upcoming event"
                >
                  Upcoming
                </div>
              )}
            </div>
          )}
          <CardHeader className={cn(
            compact ? "p-1.5 sm:p-2 pb-0" : "p-2 sm:p-2.5 md:p-3 pb-0",
            "space-y-1"
          )}>
            <CardTitle className={cn(
              "line-clamp-2 leading-tight font-semibold text-text mb-0",
              "group-hover:text-primary transition-colors duration-200",
              compact ? "text-[10px] sm:text-xs" : "text-xs sm:text-sm"
            )}>{event.title}</CardTitle>
          </CardHeader>
          {displayDescription && (
            <CardContent className={cn(
              "pt-0",
              compact ? "px-1.5 sm:px-2 pb-1.5 sm:pb-2" : "px-2 sm:px-2.5 md:px-3 pb-2 sm:pb-2.5 md:pb-3"
            )}>
              <p className={cn(
                "text-text-light leading-snug mt-0",
                "line-clamp-3",
                compact ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-xs"
              )}>{displayDescription}</p>
            </CardContent>
          )}
          {!compact && (
            <CardContent className="pt-0 px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
              <div className="flex flex-col gap-2.5 sm:gap-3">
                <div className="flex items-start gap-2 sm:gap-2.5 text-sm sm:text-base text-text-light">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{formatDate(event.eventDate, "long")}</span>
                </div>
                {event.location && (
                  <div className="flex items-start gap-2 sm:gap-2.5 text-sm sm:text-base text-text-light">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{event.location}</span>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </Link>
    </motion.div>
  );
}
