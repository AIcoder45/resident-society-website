"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { AvailabilityForm } from "./AvailabilityForm";
import { SuccessMessage } from "./SuccessMessage";
import type { Event } from "@/types";

export interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

/**
 * Modal component for marking availability for an event
 * Uses framer-motion for smooth animations
 * Mobile-first, accessible design
 */
export function AvailabilityModal({
  isOpen,
  onClose,
  event,
}: AvailabilityModalProps) {
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Ensure we're mounted before rendering portal
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Reset success state when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSuccess) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, isSuccess, onClose]);

  const handleSuccess = () => {
    setIsSuccess(true);
  };

  const handleClose = () => {
    if (!isSuccess) {
      onClose();
    }
  };

  // Don't render until mounted (prevents SSR issues)
  if (!mounted) {
    return null;
  }

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-[9999] backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Modal */}
          <div 
            className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 pointer-events-none"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              style={{ position: "relative" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
                <h2
                  id="modal-title"
                  className="text-sm sm:text-base font-semibold text-text leading-tight flex-1 min-w-0"
                >
                  {isSuccess ? (
                    "Thank You!"
                  ) : (
                    <span className="text-primary">{event.title}</span>
                  )}
                </h2>
                {!isSuccess && (
                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation flex items-center justify-center flex-shrink-0"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                {isSuccess ? (
                  <SuccessMessage onClose={onClose} />
                ) : (
                  <AvailabilityForm
                    event={event}
                    onSuccess={handleSuccess}
                    onCancel={handleClose}
                  />
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  // Render modal using portal at document body level
  return createPortal(modalContent, document.body);
}

