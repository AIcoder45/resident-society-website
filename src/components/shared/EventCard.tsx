"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, isEventUpcoming } from "@/lib/utils";
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
  // Use useState with useEffect to calculate on client side only
  // This prevents hydration mismatches by ensuring server and client render the same initial state
  const [isUpcoming, setIsUpcoming] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
    setIsUpcoming(isEventUpcoming(event.eventDate));
  }, [event.eventDate]);
  
  const displayDescription = event.description ? limitWords(event.description, 30) : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className={cn("w-full min-w-0", className)}
    >
        <Card className="h-full w-full overflow-hidden active:scale-[0.98] sm:active:scale-100 bg-white border border-gray-200/60 rounded-xl transition-all duration-300 ease-out hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30 group cursor-pointer flex flex-col relative">
        <Link href={`/events/${event.slug}`} className="absolute inset-0 z-0 touch-manipulation tap-feedback" aria-label={`View event: ${event.title}`} />
          {/* Upcoming Badge - Show on card regardless of image */}
          {/* Always render the div to maintain consistent DOM structure */}
            <div
              className={cn(
                "absolute top-1 right-1 bg-primary text-white rounded-md font-semibold shadow-lg z-20 backdrop-blur-sm",
              compact ? "px-1.5 py-0.5 text-[9px] sm:text-[10px]" : "px-2 py-1 text-[10px] sm:text-xs",
              (!mounted || !isUpcoming) && "hidden"
              )}
              aria-label="Upcoming event"
            suppressHydrationWarning
            >
              Upcoming
            </div>
          
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
              
              {/* Video Platform Icons - Positioned at bottom of image */}
              {(event.youtubeUrl || event.instagramUrl) && (
                <div className="absolute bottom-1.5 left-1.5 flex gap-1 z-20">
                  {event.youtubeUrl && (
                    <a
                      href={event.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-all duration-200 hover:scale-110 shadow-sm"
                      aria-label="Watch on YouTube"
                    >
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                  )}
                  {event.instagramUrl && (
                    <a
                      href={event.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white p-1 rounded-full transition-all duration-200 hover:scale-110 shadow-sm"
                      aria-label="View on Instagram"
                    >
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}
                </div>
              )}
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
    </motion.div>
  );
}
