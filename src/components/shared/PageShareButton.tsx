"use client";

import * as React from "react";
import { Share2 } from "lucide-react";
import { ShareButton } from "./ShareButton";
import { cn } from "@/lib/utils";

export interface PageShareButtonProps {
  url?: string;
  title?: string;
  description?: string | null;
  className?: string;
  variant?: "icon" | "button";
}

/**
 * Page Share Button Component
 * Intuitive share button designed for page headers
 * Compact, visible, and easy to use
 */
export function PageShareButton({
  url,
  title,
  description,
  className,
  variant = "icon",
}: PageShareButtonProps) {
  // Convert null to undefined for ShareButton compatibility
  const normalizedDescription = description ?? undefined;

  if (variant === "button") {
    return (
      <div className={cn("flex items-center", className)}>
        <ShareButton
          variant="inline"
          size="sm"
          url={url}
          title={title}
          description={normalizedDescription}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-end", className)}>
      <ShareButton
        variant="icon"
        size="sm"
        url={url}
        title={title}
        description={normalizedDescription}
        className="text-text hover:text-primary transition-colors"
      />
    </div>
  );
}

