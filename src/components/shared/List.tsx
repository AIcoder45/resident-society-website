"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ListProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "spaced";
}

export interface ListItemProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable list component with animations
 */
export function List({ children, className, variant = "default" }: ListProps) {
  return (
    <ul
      className={cn(
        "space-y-4",
        variant === "spaced" && "space-y-6",
        className,
      )}
    >
      {React.Children.map(children, (child, index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          {child}
        </motion.li>
      ))}
    </ul>
  );
}

export function ListItem({ children, className }: ListItemProps) {
  return <li className={cn("", className)}>{children}</li>;
}
