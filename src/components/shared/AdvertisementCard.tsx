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

export interface AdvertisementCardProps {
  advertisement: Advertisement;
  index?: number;
  className?: string;
}

/**
 * Advertisement Card Component
 * Displays resident advertisements with business info, offers, and contact details
 */
export function AdvertisementCard({
  advertisement,
  index = 0,
  className,
}: AdvertisementCardProps) {
  const isExpired = advertisement.validUntil
    ? new Date(advertisement.validUntil) < new Date()
    : false;

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
          "h-full w-full flex flex-col overflow-hidden transition-all hover:shadow-lg",
          isExpired && "opacity-75"
        )}
      >
        {/* Image */}
        <Link href={`/advertisements/${advertisement.id}`} className="block touch-manipulation">
          {advertisement.image ? (
            <div className="relative w-full h-52 sm:h-48 overflow-hidden cursor-pointer">
              <Image
                src={advertisement.image}
                alt={advertisement.title}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {isExpired && (
                <div className="absolute top-2 right-2" aria-label="Advertisement expired">
                  <Badge variant="destructive">Expired</Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="relative w-full h-48 overflow-hidden bg-primary/10 flex items-center justify-center cursor-pointer">
              <Tag className="h-16 w-16 text-primary/30" />
              {isExpired && (
                <div className="absolute top-2 right-2" aria-label="Advertisement expired">
                  <Badge variant="destructive">Expired</Badge>
                </div>
              )}
            </div>
          )}
        </Link>

        <CardHeader>
          <Link href={`/advertisements/${advertisement.id}`} className="hover:text-primary transition-colors touch-manipulation">
            <div className="flex items-start justify-between gap-2 mb-2">
              <CardTitle className="text-base sm:text-lg line-clamp-2">{advertisement.title}</CardTitle>
              <Badge variant="outline" className="ml-2 flex-shrink-0">
                {advertisement.category}
              </Badge>
            </div>
            {advertisement.businessName && (
              <p className="text-sm font-semibold text-primary">{advertisement.businessName}</p>
            )}
          </Link>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <Link href={`/advertisements/${advertisement.id}`} className="block mb-4 touch-manipulation">
            <p className="text-sm text-text-light line-clamp-3 hover:text-primary transition-colors">
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
      </Card>
    </motion.div>
  );
}

