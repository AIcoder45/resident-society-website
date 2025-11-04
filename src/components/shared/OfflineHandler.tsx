"use client";

import * as React from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Offline Handler Component
 * Detects network status and shows user-friendly offline messages
 * Provides retry functionality when connection is restored
 */
export function OfflineHandler() {
  const [isOnline, setIsOnline] = React.useState(true);
  const [wasOffline, setWasOffline] = React.useState(false);

  React.useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Show success message briefly
        setTimeout(() => setWasOffline(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
            "fixed bottom-20 left-0 right-0 z-50 px-4 safe-area-inset-bottom",
            "lg:hidden" // Hide on desktop
          )}
        >
          <div className="bg-warning/95 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <WifiOff className="h-6 w-6 text-warning-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text mb-1">
                  No Internet Connection
                </h3>
                <p className="text-xs text-text-light line-height-1.5">
                  You're offline. Some features may not be available. We'll automatically retry when you're back online.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {isOnline && wasOffline && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed bottom-20 left-0 right-0 z-50 px-4 pb-safe-area-inset-bottom",
            "lg:hidden"
          )}
        >
          <div className="bg-success/95 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Wifi className="h-6 w-6 text-success-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text">
                  Back Online
                </p>
              </div>
              <Button
                onClick={handleRetry}
                size="sm"
                variant="outline"
                className="touch-target tap-feedback"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

