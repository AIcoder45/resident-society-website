"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  viewAllLink?: {
    href: string;
    label: string;
  };
  headerAction?: React.ReactNode;
}

/**
 * Reusable section component with optional title and subtitle
 * Includes fade-in animation on mount
 */
export function Section({
  title,
  subtitle,
  children,
  className,
  id,
  viewAllLink,
  headerAction,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "w-full",
        "pt-4 pb-8 sm:pt-6 sm:pb-10 md:pt-8 md:pb-12 lg:pt-12 lg:pb-16", // Mobile-first spacing - reduced top padding
        "px-4 sm:px-6 md:px-8", // Horizontal padding for mobile
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        {(title || subtitle || viewAllLink || headerAction) && (
          <div className="mb-4 sm:mb-5 md:mb-6">
            {title && (
              <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-2.5">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text leading-tight flex-1">
                {title}
              </h2>
                <div className="flex items-center gap-2">
                  {headerAction}
                  {viewAllLink && (
                    <Link
                      href={viewAllLink.href}
                      className="flex items-center gap-1 text-xs sm:text-sm text-primary hover:text-primary-dark font-medium transition-colors whitespace-nowrap touch-manipulation min-h-[32px] px-2"
                    >
                      <span>{viewAllLink.label}</span>
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                  )}
                </div>
              </div>
            )}
            {subtitle && (
              <p className="text-sm sm:text-base md:text-lg text-text-light max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="w-full">{children}</div>
      </motion.div>
    </section>
  );
}




