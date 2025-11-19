"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
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
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "w-full",
        "py-8 sm:py-10 md:py-12 lg:py-16", // Mobile-first spacing
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
        {(title || subtitle) && (
          <div className="mb-6 sm:mb-7 md:mb-8 text-center sm:text-left">
            {title && (
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text mb-2 sm:mb-3 leading-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm sm:text-base md:text-lg text-text-light max-w-2xl mx-auto sm:mx-0 leading-relaxed">
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




