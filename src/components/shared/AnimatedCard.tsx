"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AnimatedCardProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
}

/**
 * Client component wrapper for animated cards
 * Handles framer-motion animations without breaking server components
 */
export function AnimatedCard({
  children,
  index = 0,
  className,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={cn("w-full min-w-0", className)}
    >
      {children}
    </motion.div>
  );
}

