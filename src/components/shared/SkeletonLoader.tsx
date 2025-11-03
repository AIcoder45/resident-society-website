"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

/**
 * Skeleton Loader Component
 * Provides loading placeholders that match content structure
 * Mobile-optimized with smooth animations
 */
export function SkeletonLoader({
  className,
  variant = "rectangular",
  width,
  height,
  lines = 1,
}: SkeletonLoaderProps) {
  const baseClasses = "skeleton bg-gray-200 rounded";

  if (variant === "card") {
    return (
      <div className={cn("w-full overflow-hidden", className)}>
        <div className={cn(baseClasses, "h-48 w-full mb-4")} />
        <div className={cn(baseClasses, "h-6 w-3/4 mb-2")} />
        <div className={cn(baseClasses, "h-4 w-full mb-1")} />
        <div className={cn(baseClasses, "h-4 w-5/6")} />
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              "h-4",
              i === lines - 1 ? "w-3/4" : "w-full"
            )}
            style={width ? { width } : undefined}
          />
        ))}
      </div>
    );
  }

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  const shapeClasses =
    variant === "circular" ? "rounded-full" : "rounded-md";

  return (
    <div
      className={cn(baseClasses, shapeClasses, className)}
      style={style}
      aria-label="Loading..."
      role="status"
    />
  );
}

/**
 * Card Grid Skeleton Loader
 * For loading multiple cards in a grid layout
 */
interface CardGridSkeletonProps {
  count?: number;
  columns?: 1 | 2 | 3;
}

export function CardGridSkeleton({
  count = 6,
  columns = 3,
}: CardGridSkeletonProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <div className={cn("grid gap-6 w-full", gridCols[columns])}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonLoader key={i} variant="card" />
      ))}
    </div>
  );
}


