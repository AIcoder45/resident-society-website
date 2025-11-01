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
      className={cn("py-8 md:py-12 lg:py-16 w-full", className)}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        {(title || subtitle) && (
          <div className="mb-6 md:mb-8">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-2">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-text-light max-w-2xl">{subtitle}</p>
            )}
          </div>
        )}
        <div className="w-full">{children}</div>
      </motion.div>
    </section>
  );
}
