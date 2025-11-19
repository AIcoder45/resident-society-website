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
}: ContentCardProps) {
  const displayDescription = description ? limitWords(description, 30) : "";

  const cardContent = (
    <Card
      className={cn(
        "h-full w-full overflow-hidden touch-manipulation",
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
          "relative w-full overflow-hidden",
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
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}
      <CardHeader className={cn(
        compact ? "p-1.5 sm:p-2 pb-0" : "p-2 sm:p-2.5 md:p-3 pb-0",
        "space-y-1"
      )}>
        {category && (
          <span className="text-[8px] sm:text-[9px] font-semibold text-primary uppercase tracking-wider mb-0.5 block">
            {category}
          </span>
        )}
        <CardTitle className={cn(
          "line-clamp-2 leading-tight font-semibold text-text mb-0",
          "group-hover:text-primary transition-colors duration-200",
          compact ? "text-[10px] sm:text-xs" : "text-xs sm:text-sm"
        )}>{title}</CardTitle>
        {date && (
          <CardDescription className={cn(
            "text-text-light/70",
            compact ? "text-[8px] sm:text-[9px]" : "text-[9px] sm:text-[10px]"
          )}>{formatDate(date, "short")}</CardDescription>
        )}
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
    </Card>
  );

  if (href) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="w-full min-w-0"
      >
        <Link href={href} className="block h-full w-full touch-manipulation tap-feedback">
          {cardContent}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="w-full min-w-0"
    >
      {cardContent}
    </motion.div>
  );
}
