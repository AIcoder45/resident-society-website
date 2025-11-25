"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

/**
 * Limit text to approximately 30 words
 */
function limitWords(text: string, maxWords: number = 30): string {
  const words = text.split(" ");
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

export interface ContentCardProps {
  title: string;
  description?: string;
  image?: string;
  href?: string;
  date?: string;
  category?: string;
  className?: string;
  priority?: "normal" | "urgent";
  compact?: boolean;
  youtubeUrl?: string;
  instagramUrl?: string;
}

/**
 * Reusable content card component for news, events, etc.
 * Supports image, title, description, and optional link
 */
export function ContentCard({
  title,
  description,
  image,
  href,
  date,
  category,
  className,
  priority,
  compact = false,
  youtubeUrl,
  instagramUrl,
}: ContentCardProps) {
  const displayDescription = description ? limitWords(description, 30) : "";

  const cardContent = (
    <Card
      className={cn(
        "h-full w-full overflow-hidden touch-manipulation flex flex-col",
        "bg-white border border-gray-200/60 rounded-xl",
        "transition-all duration-300 ease-out",
        "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30",
        "active:scale-[0.98] sm:active:scale-100",
        "group cursor-pointer",
        priority === "urgent" && "border-2 border-red-500 shadow-red-500/10",
        className,
      )}
    >
      {image && (
        <div className={cn(
          "relative w-full overflow-hidden flex-shrink-0",
          compact ? "h-[72px] sm:h-[80px] md:h-[88px]" : "h-[96px] sm:h-[104px] md:h-[112px]",
          "bg-gradient-to-br from-gray-100 to-gray-200"
        )}>
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            loading="lazy"
            unoptimized={image.startsWith("/") && !image.startsWith("http")}
            suppressHydrationWarning
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Video Platform Icons - Positioned at bottom of image */}
          {(youtubeUrl || instagramUrl) && (
            <div className="absolute bottom-1.5 left-1.5 flex gap-1 z-20">
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
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
              {instagramUrl && (
                <a
                  href={instagramUrl}
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
        {category && (
          <span className="text-[8px] sm:text-[9px] font-semibold text-primary uppercase tracking-wider mb-1 block leading-none">
            {category}
          </span>
        )}
        <CardTitle className={cn(
          "line-clamp-2 leading-tight font-semibold text-text mb-1",
          "group-hover:text-primary transition-colors duration-200",
          compact ? "text-[10px] sm:text-xs" : "text-xs sm:text-sm"
        )}>{title}</CardTitle>
        {displayDescription && (
          <p className={cn(
            "text-text-light leading-snug flex-1",
            "line-clamp-3",
            compact ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-xs"
          )}>{displayDescription}</p>
        )}
        {date && (
          <CardDescription className={cn(
            "text-text-light/70 mt-1",
            compact ? "text-[8px] sm:text-[9px]" : "text-[9px] sm:text-[10px]"
          )}>{formatDate(date, "short")}</CardDescription>
        )}
      </div>
    </Card>
  );

  // Animation props - ensure cards are always visible
  // Use animate instead of whileInView to prevent disappearing
  const motionProps = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2, ease: "easeOut" },
  };

  if (href) {
    return (
      <motion.div
        {...motionProps}
        className="w-full min-w-0"
      >
        <div className="relative h-full w-full">
          <Link href={href} className="absolute inset-0 z-0 touch-manipulation tap-feedback" aria-label={title} />
          {cardContent}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      {...motionProps}
      className="w-full min-w-0"
    >
      {cardContent}
    </motion.div>
  );
}
