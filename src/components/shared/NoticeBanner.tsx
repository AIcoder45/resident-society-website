"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types";

export interface NoticeBannerProps {
  notification: Notification;
  className?: string;
}

/**
 * Banner component for displaying notifications
 * Supports normal and urgent priority levels
 */
export function NoticeBanner({ notification, className }: NoticeBannerProps) {
  const isUrgent = notification.priority === "urgent";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-lg p-4 mb-4",
        isUrgent
          ? "bg-red-50 border-2 border-red-500"
          : "bg-background-dark border border-primary-light",
        className,
      )}
      role="alert"
      aria-live={isUrgent ? "assertive" : "polite"}
    >
      <div className="flex items-start gap-3">
        {isUrgent && (
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <h3
            className={cn(
              "font-semibold mb-1",
              isUrgent ? "text-red-900" : "text-primary-dark",
            )}
          >
            {notification.title}
          </h3>
          <p
            className={cn(
              "text-sm",
              isUrgent ? "text-red-800" : "text-primary",
            )}
          >
            {notification.message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
