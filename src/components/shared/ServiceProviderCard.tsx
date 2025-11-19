"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServiceProvider } from "@/types";

export interface ServiceProviderCardProps {
  provider: ServiceProvider;
  className?: string;
  index?: number;
}

/**
 * Service Provider Card Component
 * Displays service provider information
 */
export function ServiceProviderCard({
  provider,
  className,
  index = 0,
}: ServiceProviderCardProps) {
  const [isCalling, setIsCalling] = React.useState(false);

  const handleCall = () => {
    setIsCalling(true);
    window.location.href = `tel:${provider.phone}`;
    setTimeout(() => setIsCalling(false), 1000);
  };

  const handleEmail = () => {
    if (provider.email) {
      window.location.href = `mailto:${provider.email}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn("w-full min-w-0", className)}
    >
      <Card className="h-full w-full transition-all duration-300 ease-out hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30 overflow-hidden border border-gray-200/60 rounded-xl bg-white flex flex-col active:scale-[0.98] sm:active:scale-100 group cursor-pointer">
        {/* Image Section */}
        {provider.image && (
          <div className="relative w-full h-[72px] sm:h-[80px] md:h-[88px] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
            <Image
              src={provider.image}
              alt={provider.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Overlay Badges */}
            <div className="absolute top-1 right-1 flex flex-col gap-1 items-end">
              {provider.verified && (
                <Badge
                  variant="outline"
                  className="text-[8px] sm:text-[9px] px-0.5 py-0 border-green-500 text-green-700 bg-white/95 backdrop-blur-sm font-semibold shadow-sm"
                >
                  <CheckCircle2 className="h-2 w-2 mr-0.5" />
                  Verified
                </Badge>
              )}
              {provider.emergency && (
                <Badge
                  variant="outline"
                  className="text-[8px] sm:text-[9px] px-0.5 py-0 border-red-500 text-red-700 bg-white/95 backdrop-blur-sm font-semibold shadow-sm"
                >
                  <AlertCircle className="h-2 w-2 mr-0.5" />
                  Emergency
                </Badge>
              )}
            </div>
          </div>
        )}

        <CardContent className="p-2 flex-1 flex flex-col">
          {/* Header Section */}
          <div className="mb-1">
            {/* Name and Badges */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[10px] sm:text-xs text-text mb-1 line-clamp-1 group-hover:text-primary transition-colors duration-200">
                {provider.name}
              </h3>
              <div className="flex items-center gap-1 flex-wrap">
                <Badge variant="secondary" className="text-[8px] sm:text-[9px] font-semibold capitalize px-1 py-0">
                  {provider.serviceType}
                </Badge>
                {!provider.image && provider.verified && (
                  <Badge
                    variant="outline"
                    className="text-[8px] sm:text-[9px] px-1 py-0 border-green-500 text-green-700 bg-green-50 font-semibold"
                  >
                    <CheckCircle2 className="h-2 w-2 mr-0.5" />
                    Verified
                  </Badge>
                )}
                {!provider.image && provider.emergency && (
                  <Badge
                    variant="outline"
                    className="text-[8px] sm:text-[9px] px-1 py-0 border-red-500 text-red-700 bg-red-50 font-semibold"
                  >
                    <AlertCircle className="h-2 w-2 mr-0.5" />
                    Emergency
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {provider.description && (
            <p className="text-[9px] sm:text-[10px] text-text-light mb-2 line-clamp-2 leading-snug flex-1">
              {provider.description}
            </p>
          )}

          {/* Contact Section - Prominent Phone Number */}
          <div className="space-y-1.5 pt-1.5 border-t border-gray-100 mt-auto">
            {/* Primary CTA - Phone */}
            <button
              onClick={handleCall}
              className={cn(
                "w-full flex items-center justify-center gap-1 px-1.5 py-1 sm:px-2 sm:py-1 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all touch-target tap-feedback font-semibold text-[9px] sm:text-[10px] shadow-sm hover:shadow-md min-h-[24px] sm:min-h-[28px]",
                isCalling && "opacity-75"
              )}
              aria-label={`Call ${provider.name}`}
            >
              <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="truncate">{provider.phone}</span>
            </button>

            {/* Secondary Contact Info */}
            <div className="flex flex-col gap-1">
              {provider.email && (
                <button
                  onClick={handleEmail}
                  className="flex items-center gap-1 text-[8px] sm:text-[9px] text-text hover:text-primary transition-colors touch-target tap-feedback py-0.5"
                  aria-label={`Email ${provider.name}`}
                >
                  <Mail className="h-2.5 w-2.5 flex-shrink-0 text-text-light" />
                  <span className="truncate">{provider.email}</span>
                </button>
              )}

              {provider.address && (
                <div className="flex items-start gap-1 text-[8px] sm:text-[9px] text-text-light py-0.5">
                  <MapPin className="h-2.5 w-2.5 flex-shrink-0 mt-0.5 text-text-light" />
                  <span className="line-clamp-2 leading-tight">{provider.address}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

