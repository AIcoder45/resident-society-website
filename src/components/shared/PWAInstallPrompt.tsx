"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * PWA Install Prompt Component
 * Shows install prompt when browser supports PWA installation
 */
export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);

  React.useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if running in standalone mode (iOS)
    if ((window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a delay to avoid interrupting initial load
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if already installed
    const checkInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true);
        setShowPrompt(false);
      }
    };

    checkInstalled();

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for this session
    sessionStorage.setItem("pwa-install-dismissed", "true");
  };

  // Don't show if already installed or dismissed this session
  if (
    isInstalled ||
    !showPrompt ||
    !deferredPrompt ||
    sessionStorage.getItem("pwa-install-dismissed") === "true"
  ) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-50 lg:hidden safe-area-inset-bottom"
        >
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 max-w-sm mx-auto">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-text mb-1">
                  Install App
                </h3>
                <p className="text-sm text-text-light">
                  Install Greenwood City Block C for quick access and offline support.
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors touch-manipulation min-h-[32px] min-w-[32px] flex items-center justify-center"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                className="flex-1 touch-manipulation min-h-[44px]"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Install
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="touch-manipulation min-h-[44px]"
                size="sm"
              >
                Later
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

