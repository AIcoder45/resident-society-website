"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MobileHeroProps {
  welcomeText?: string;
  title: string;
  subtitle?: string;
  description: string;
  descriptionMobile?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  className?: string;
}

/**
 * Mobile-optimized Hero component
 * Designed specifically for iPhone 12 and similar mobile devices (390px width)
 * Uses smart Tailwind responsive classes for optimal mobile UX
 */
export function MobileHero({
  welcomeText = "Welcome to",
  title,
  subtitle,
  description,
  descriptionMobile,
  primaryAction,
  secondaryAction,
  className,
}: MobileHeroProps) {
  const displayDescription = descriptionMobile || description;

  // Combine welcome text, title, and subtitle into one line
  const combinedTitle = subtitle 
    ? `${welcomeText || ""} ${title} ${subtitle}`.trim()
    : `${welcomeText || ""} ${title}`.trim();

  return (
    <section
      className={cn(
        "bg-primary text-white",
        "py-3 sm:py-4 md:py-5", // Further reduced vertical padding
        "px-4 sm:px-6", // Horizontal padding optimized for mobile
        className
      )}
    >
      <div className="mx-auto max-w-full sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%]">
        <div className="text-center space-y-2 sm:space-y-2.5 md:space-y-3">
          {/* Combined Title - Line 1 */}
          <h1 className="text-base sm:text-lg md:text-xl font-semibold leading-tight text-white line-clamp-1">
            {combinedTitle}
          </h1>

          {/* Description - Line 2 */}
          <p className="text-xs sm:text-sm md:text-base text-white/90 max-w-2xl mx-auto leading-relaxed px-2 line-clamp-2">
            {/* Mobile-specific description */}
            <span className="block sm:hidden">{displayDescription}</span>
            {/* Desktop description */}
            <span className="hidden sm:block">{description}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

