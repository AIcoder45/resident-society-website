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
 * Strip HTML tags and limit text to approximately 30 words
 * Returns plain text (same as ContentCard and AdvertisementCard)
 */
function limitWords(text: string, maxWords: number = 30): string {
  if (!text) return "";
  
  // Strip HTML tags and convert to plain text
  const textWithoutHtml = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = textWithoutHtml.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length <= maxWords) return textWithoutHtml;
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
  // Better date comparison - compare dates only (ignore time)
  const eventDate = new Date(event.eventDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  eventDate.setHours(0, 0, 0, 0); // Reset time to start of day
  const isUpcoming = eventDate >= today;
  
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
        <Card className="h-full w-full overflow-hidden active:scale-[0.98] sm:active:scale-100 bg-white border border-gray-200/60 rounded-xl transition-all duration-300 ease-out hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30 group cursor-pointer flex flex-col relative">
          {/* Upcoming Badge - Show on card regardless of image */}
          {isUpcoming && (
            <div
              className={cn(
                "absolute top-1 right-1 bg-primary text-white rounded-md font-semibold shadow-lg z-20 backdrop-blur-sm",
                compact ? "px-1.5 py-0.5 text-[9px] sm:text-[10px]" : "px-2 py-1 text-[10px] sm:text-xs"
              )}
              aria-label="Upcoming event"
            >
              Upcoming
            </div>
          )}
          
          {event.coverImage && (
            <div className={cn(
              "relative w-full overflow-hidden flex-shrink-0",
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
            </div>
          )}
          <div className={cn(
            "flex flex-col flex-1",
            compact ? "p-2" : "p-2.5 sm:p-3"
          )}>
            <CardTitle className={cn(
              "line-clamp-2 leading-tight font-semibold text-text mb-1",
              "group-hover:text-primary transition-colors duration-200",
              compact ? "text-[10px] sm:text-xs" : "text-xs sm:text-sm"
            )}>{event.title}</CardTitle>
            
            {/* Date and Location - Compact Inline Display */}
            <div className={cn(
              "flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1",
              compact ? "text-[8px] sm:text-[9px]" : "text-[9px] sm:text-[10px]"
            )}>
              <div className="flex items-center gap-1 text-text-light/80">
                <Calendar className={cn(
                  "text-primary flex-shrink-0",
                  compact ? "h-2.5 w-2.5" : "h-3 w-3"
                )} />
                <span className="leading-tight whitespace-nowrap">{formatDate(event.eventDate, "short")}</span>
                </div>
                {event.location && (
                <>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1 text-text-light/80">
                    <MapPin className={cn(
                      "text-primary flex-shrink-0",
                      compact ? "h-2.5 w-2.5" : "h-3 w-3"
                    )} />
                    <span className="leading-tight line-clamp-1">{event.location}</span>
                  </div>
                </>
              )}
            </div>
            
            {/* Description - Plain Text (Same as ContentCard) */}
            {displayDescription && (
              <p className={cn(
                "text-text-light leading-snug flex-1",
                "line-clamp-3",
                compact ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-xs"
              )}>{displayDescription}</p>
                )}
              </div>
        </Card>
      </Link>
    </motion.div>
  );
}
