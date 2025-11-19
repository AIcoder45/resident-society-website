"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, Globe, Tag, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { Advertisement } from "@/types";

/**
 * Limit text to approximately 30 words
 */
function limitWords(text: string, maxWords: number = 30): string {
  const words = text.split(" ");
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

export interface AdvertisementCardProps {
  advertisement: Advertisement;
  index?: number;
  className?: string;
  compact?: boolean;
}

/**
 * Advertisement Card Component
 * Displays resident advertisements with business info, offers, and contact details
 */
export function AdvertisementCard({
  advertisement,
  index = 0,
  className,
  compact = false,
}: AdvertisementCardProps) {
  const isExpired = advertisement.validUntil
    ? new Date(advertisement.validUntil) < new Date()
    : false;
  const displayDescription = advertisement.description ? limitWords(advertisement.description, 30) : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={cn("w-full min-w-0", className)}
    >
      <Card
        className={cn(
          "h-full w-full flex flex-col overflow-hidden",
          "bg-white border border-gray-200/60 rounded-xl",
          "transition-all duration-300 ease-out",
          "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30",
          "active:scale-[0.98] sm:active:scale-100",
          "group cursor-pointer",
          isExpired && "opacity-75"
        )}
      >
        {/* Image */}
        <Link href={`/advertisements/${advertisement.id}`} className="block touch-manipulation flex-shrink-0">
          {advertisement.image ? (
            <div className={cn(
              "relative w-full overflow-hidden cursor-pointer",
              compact ? "h-[72px] sm:h-[80px] md:h-[88px]" : "h-[96px] sm:h-[104px] md:h-[112px]",
              "bg-gradient-to-br from-gray-100 to-gray-200"
            )}>
              <Image
                src={advertisement.image}
                alt={advertisement.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {isExpired && (
                <div className={cn(
                  "absolute top-1 right-1",
                  compact && "top-0.5 right-0.5"
                )} aria-label="Advertisement expired">
                  <Badge variant="destructive" className={cn(compact ? "text-[8px] px-0.5 py-0" : "text-[9px] px-1 py-0")}>Expired</Badge>
                </div>
              )}
            </div>
          ) : (
            <div className={cn(
              "relative w-full overflow-hidden bg-primary/10 flex items-center justify-center cursor-pointer",
              compact ? "h-[72px] sm:h-[80px] md:h-[88px]" : "h-[96px] sm:h-[104px] md:h-[112px]"
            )}>
              <Tag className={cn(
                compact ? "h-4 w-4 sm:h-5 sm:w-5" : "h-6 w-6 sm:h-8 sm:w-8",
                "text-primary/30"
              )} />
              {isExpired && (
                <div className={cn(
                  "absolute top-1 right-1",
                  compact && "top-0.5 right-0.5"
                )} aria-label="Advertisement expired">
                  <Badge variant="destructive" className={cn(compact ? "text-[8px] px-0.5 py-0" : "text-[9px] px-1 py-0")}>Expired</Badge>
                </div>
              )}
            </div>
          )}
        </Link>

        <div className={cn(
          "flex flex-col flex-1",
          compact ? "p-1.5 sm:p-2" : "p-2.5 sm:p-3"
        )}>
          <Link href={`/advertisements/${advertisement.id}`} className="hover:text-primary transition-colors touch-manipulation">
            <CardTitle className={cn(
              "line-clamp-2 leading-tight font-semibold text-text mb-0",
              "group-hover:text-primary transition-colors duration-200",
              compact ? "text-[10px] sm:text-xs" : "text-xs sm:text-sm"
            )}>{advertisement.title}</CardTitle>
            {advertisement.businessName && !compact && (
              <p className="text-[9px] sm:text-[10px] font-semibold text-primary mb-1 mt-0">{advertisement.businessName}</p>
            )}
          </Link>
          {displayDescription && (
            <p className={cn(
              "text-text-light leading-tight flex-1 mt-0",
              "line-clamp-2",
              compact ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-xs"
            )}>{displayDescription}</p>
          )}
        </div>

        {!compact && (
          <CardContent className="flex-1 flex flex-col px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
            <Link href={`/advertisements/${advertisement.id}`} className="block mb-3 sm:mb-4 touch-manipulation">
              <p className="text-sm sm:text-base text-text-light line-clamp-3 hover:text-primary transition-colors leading-relaxed">
              {advertisement.description}
            </p>
          </Link>

          {/* Offers and Discounts */}
          {(advertisement.discount || advertisement.offer) && (
            <div className="mb-4 space-y-2">
              {advertisement.discount && (
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-primary">Discount: {advertisement.discount}</span>
                </div>
              )}
              {advertisement.offer && (
                <div className="flex items-center gap-2 text-sm text-text-light">
                  <Tag className="h-4 w-4 text-primary" />
                  <span>{advertisement.offer}</span>
                </div>
              )}
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-2 mb-4">
            {advertisement.contactPhone && (
              <a
                href={`tel:${advertisement.contactPhone.replace(/\s+/g, "")}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-sm text-text-light hover:text-primary transition-colors touch-manipulation touch-target tap-feedback"
              >
                <Phone className="h-4 w-4" />
                <span>{advertisement.contactPhone}</span>
              </a>
            )}
            {advertisement.contactEmail && (
              <a
                href={`mailto:${advertisement.contactEmail}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-sm text-text-light hover:text-primary transition-colors touch-manipulation touch-target tap-feedback"
              >
                <Mail className="h-4 w-4" />
                <span>{advertisement.contactEmail}</span>
              </a>
            )}
            {advertisement.website && (
              <a
                href={advertisement.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-sm text-text-light hover:text-primary transition-colors touch-manipulation touch-target tap-feedback"
              >
                <Globe className="h-4 w-4" />
                <span className="truncate">{advertisement.website.replace(/^https?:\/\//, "")}</span>
              </a>
            )}
          </div>

          {/* Valid Until */}
          {advertisement.validUntil && (
            <div className="flex items-center gap-2 text-xs text-text-light mt-auto pt-2 border-t">
              <Calendar className="h-3 w-3" />
              <span>Valid until: {formatDate(advertisement.validUntil, "short")}</span>
            </div>
          )}
        </CardContent>
        )}
      </Card>
    </motion.div>
  );
}

