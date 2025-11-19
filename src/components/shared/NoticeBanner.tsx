"use client";

import * as React from "react";
import { AlertCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { Notification } from "@/types";

export interface NoticeBannerProps {
  notification: Notification;
  className?: string;
}

/**
 * Banner component for displaying notifications
 * Mobile-optimized card design with intuitive layout
 */
export function NoticeBanner({ notification, className }: NoticeBannerProps) {
  const isUrgent = notification.priority === "urgent";
  const notificationDate = new Date(notification.createdAt);
  const isToday = notificationDate.toDateString() === new Date().toDateString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-xl p-3 sm:p-4 transition-all duration-300",
        "bg-white border",
        isUrgent
          ? "border-red-500/50 bg-red-50/50 shadow-sm shadow-red-500/10"
          : "border-gray-200/60 shadow-sm hover:shadow-md hover:border-primary/30",
        "active:scale-[0.98] sm:active:scale-100",
        className,
      )}
      role="alert"
      aria-live={isUrgent ? "assertive" : "polite"}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Icon */}
        {isUrgent && (
          <div className="flex-shrink-0 mt-0.5">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header: Title + Badge */}
          <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
            <h3
              className={cn(
                "font-semibold text-sm sm:text-base leading-tight flex-1",
                isUrgent ? "text-red-900" : "text-text",
              )}
            >
              {notification.title}
            </h3>
            {isUrgent && (
              <span className="flex-shrink-0 bg-red-500 text-white text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider">
                Urgent
              </span>
            )}
          </div>

          {/* Message */}
          <p
            className={cn(
              "text-xs sm:text-sm leading-relaxed mb-2",
              isUrgent ? "text-red-800" : "text-text-light",
            )}
          >
            {notification.message}
          </p>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-text-light/70">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span>
              {isToday ? "Today" : formatDate(notification.createdAt, "short")}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
