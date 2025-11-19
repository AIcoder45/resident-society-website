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
    // Only run on client side
    if (typeof window === "undefined") return;

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

    // Check if dismissed in session storage
    if (sessionStorage.getItem("pwa-install-dismissed") === "true") {
      return;
    }

    // Listen for beforeinstallprompt event (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a delay to avoid interrupting initial load
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS Safari, show manual install instructions after delay
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isIOS && isSafari) {
      // Show iOS install prompt after delay
      setTimeout(() => {
        // Check if still not installed and not dismissed
        const stillNotInstalled = !window.matchMedia("(display-mode: standalone)").matches && 
                                  !(window.navigator as any).standalone;
        if (stillNotInstalled && !sessionStorage.getItem("pwa-install-dismissed")) {
          setShowPrompt(true);
        }
      }, 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    try {
      if (deferredPrompt) {
        // Show the install prompt (Chrome/Edge)
        await deferredPrompt.prompt();

        // Wait for user response
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
          setShowPrompt(false);
          setIsInstalled(true);
        } else {
          // User dismissed, hide prompt
          setShowPrompt(false);
        }

        setDeferredPrompt(null);
      } else {
        // For iOS Safari or other browsers, show instructions
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        if (isIOS) {
          alert("To install this app:\n1. Tap the Share button (square with arrow)\n2. Select 'Add to Home Screen'\n3. Tap 'Add'");
        } else {
          // For Android browsers without beforeinstallprompt
          alert("To install this app:\n1. Tap the menu (⋮)\n2. Select 'Add to Home Screen' or 'Install App'");
        }
        setShowPrompt(false);
      }
    } catch (error) {
      console.error("Error installing PWA:", error);
      // Fallback: show manual instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        alert("To install this app:\n1. Tap the Share button (square with arrow)\n2. Select 'Add to Home Screen'\n3. Tap 'Add'");
      } else {
        alert("To install this app:\n1. Tap the menu (⋮)\n2. Select 'Add to Home Screen' or 'Install App'");
      }
      setShowPrompt(false);
    }
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
    sessionStorage.getItem("pwa-install-dismissed") === "true"
  ) {
    return null;
  }

  // Show prompt even if deferredPrompt is null (for iOS)
  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-20 sm:bottom-24 left-3 right-3 sm:left-4 sm:right-4 z-[55] lg:hidden safe-area-inset-bottom"
        >
          <div className="bg-white rounded-lg shadow-xl border border-gray-200/60 p-2 max-w-sm mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-text truncate">
                  Install App
                </h3>
                <p className="text-[10px] text-text-light leading-tight line-clamp-1">
                  Quick access & offline support
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation min-h-[28px] min-w-[28px] flex items-center justify-center"
                aria-label="Dismiss"
              >
                <X className="h-3 w-3 text-gray-500" />
              </button>
            </div>
            <div className="flex gap-1.5">
              <Button
                onClick={handleInstall}
                className="flex-1 touch-manipulation min-h-[32px] text-[10px] px-2 py-1 h-auto"
                size="sm"
              >
                <Download className="h-3 w-3 mr-1" />
                Install
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="touch-manipulation min-h-[32px] text-[10px] px-2 py-1 h-auto"
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

