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
  Wrench,
  Zap,
  TreePine,
  Hammer,
  Paintbrush,
  Car,
  Wind,
  Sparkles,
  Shield,
  Key,
  Refrigerator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServiceProvider } from "@/types";

export interface ServiceProviderCardProps {
  provider: ServiceProvider;
  className?: string;
  index?: number;
}

/**
 * Icon mapping for different service types
 */
const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  plumber: Wrench,
  electrician: Zap,
  gardener: TreePine,
  landscaper: TreePine,
  carpenter: Hammer,
  painter: Paintbrush,
  mechanic: Car,
  "ac-repair": Wind,
  "ac-repairer": Wind,
  hvac: Wind,
  cleaner: Sparkles,
  cleaning: Sparkles,
  security: Shield,
  locksmith: Key,
  "appliance-repair": Refrigerator,
  default: Wrench,
};

/**
 * Get icon for service type
 */
function getServiceIcon(serviceType: string) {
  const normalizedType = serviceType.toLowerCase().replace(/\s+/g, "-");
  return serviceIcons[normalizedType] || serviceIcons.default;
}

/**
 * Service Provider Card Component
 * Displays service provider information with appropriate icon
 */
export function ServiceProviderCard({
  provider,
  className,
  index = 0,
}: ServiceProviderCardProps) {
  const Icon = getServiceIcon(provider.serviceType);
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
      <Card className="h-full w-full transition-all hover:shadow-xl hover:border-primary/20 overflow-hidden border border-gray-200 bg-white flex flex-col">
        {/* Image Section */}
        {provider.image && (
          <div className="relative w-full h-48 overflow-hidden bg-gray-100">
            <Image
              src={provider.image}
              alt={provider.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
            />
            {/* Overlay Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
              {provider.verified && (
                <Badge
                  variant="outline"
                  className="text-xs border-green-500 text-green-700 bg-white/95 backdrop-blur-sm font-semibold shadow-sm"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
              {provider.emergency && (
                <Badge
                  variant="outline"
                  className="text-xs border-red-500 text-red-700 bg-white/95 backdrop-blur-sm font-semibold shadow-sm"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Emergency
                </Badge>
              )}
            </div>
          </div>
        )}

        <CardContent className="p-5 flex-1 flex flex-col">
          {/* Header Section */}
          <div className="flex items-start gap-4 mb-4">
            {/* Service Icon */}
            <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0 border border-primary/20">
              <Icon className="h-6 w-6 text-primary" />
            </div>

            {/* Name and Badges */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-text mb-2 line-clamp-1">
                {provider.name}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs font-semibold capitalize">
                  {provider.serviceType}
                </Badge>
                {!provider.image && provider.verified && (
                  <Badge
                    variant="outline"
                    className="text-xs border-green-500 text-green-700 bg-green-50 font-semibold"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {!provider.image && provider.emergency && (
                  <Badge
                    variant="outline"
                    className="text-xs border-red-500 text-red-700 bg-red-50 font-semibold"
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Emergency
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {provider.description && (
            <p className="text-sm text-text-light mb-4 line-clamp-2 leading-relaxed">
              {provider.description}
            </p>
          )}

          {/* Contact Section - Prominent Phone Number */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            {/* Primary CTA - Phone */}
            <button
              onClick={handleCall}
              className={cn(
                "w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all touch-target tap-feedback font-semibold text-base shadow-sm hover:shadow-md",
                isCalling && "opacity-75"
              )}
              aria-label={`Call ${provider.name}`}
            >
              <Phone className="h-5 w-5" />
              <span>{provider.phone}</span>
            </button>

            {/* Secondary Contact Info */}
            <div className="flex flex-col gap-2.5">
              {provider.email && (
                <button
                  onClick={handleEmail}
                  className="flex items-center gap-2.5 text-sm text-text hover:text-primary transition-colors touch-target tap-feedback py-1.5"
                  aria-label={`Email ${provider.name}`}
                >
                  <Mail className="h-4 w-4 flex-shrink-0 text-text-light" />
                  <span className="truncate">{provider.email}</span>
                </button>
              )}

              {provider.address && (
                <div className="flex items-start gap-2.5 text-sm text-text-light py-1.5">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-text-light" />
                  <span className="line-clamp-2">{provider.address}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

