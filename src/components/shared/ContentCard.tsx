"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

export interface ContentCardProps {
  title: string;
  description?: string;
  image?: string;
  href?: string;
  date?: string;
  category?: string;
  className?: string;
  priority?: "normal" | "urgent";
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
}: ContentCardProps) {
  const cardContent = (
    <Card
      className={cn(
        "h-full w-full transition-all hover:shadow-lg overflow-hidden touch-manipulation",
        priority === "urgent" && "border-2 border-red-500",
        className,
      )}
    >
      {image && (
        <div className="relative w-full h-52 sm:h-48 overflow-hidden rounded-t-lg">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
        </div>
      )}
      <CardHeader>
        {category && (
          <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
            {category}
          </span>
        )}
        <CardTitle className="line-clamp-2">{title}</CardTitle>
        {date && (
          <CardDescription>{formatDate(date, "short")}</CardDescription>
        )}
      </CardHeader>
      {description && (
        <CardContent>
          <p className="text-sm text-text-light line-clamp-3">{description}</p>
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
