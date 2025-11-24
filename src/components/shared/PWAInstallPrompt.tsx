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

    // Listen for beforeinstallprompt event (Chrome/Edge/Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      // Verify the event has the required methods
      if (promptEvent.prompt && typeof promptEvent.prompt === 'function') {
        setDeferredPrompt(promptEvent);
        // Show prompt after a delay to avoid interrupting initial load
        setTimeout(() => {
          setShowPrompt(true);
        }, 2000);
      }
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
      if (deferredPrompt && deferredPrompt.prompt) {
        // Show the install prompt (Chrome/Edge/Android)
        await deferredPrompt.prompt();

        // Wait for user response
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
          setShowPrompt(false);
          setIsInstalled(true);
          // Clear deferred prompt after successful installation
          setDeferredPrompt(null);
        } else {
          // User dismissed, hide prompt
          setShowPrompt(false);
          setDeferredPrompt(null);
        }
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
      setDeferredPrompt(null);
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
    (typeof window !== "undefined" && sessionStorage.getItem("pwa-install-dismissed") === "true")
  ) {
    return null;
  }

  // Only show if we have deferredPrompt (Android/Chrome) or on iOS Safari
  // Check iOS only on client side
  if (typeof window !== "undefined") {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (!deferredPrompt && !isIOS) {
      return null;
    }
  } else if (!deferredPrompt) {
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
          className="fixed bottom-20 sm:bottom-24 left-2 right-2 sm:left-3 sm:right-3 z-[55] lg:hidden safe-area-inset-bottom"
        >
          <div className="bg-white rounded-lg shadow-xl border border-gray-200/60 p-1.5 max-w-xs mx-auto">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="flex-1 min-w-0">
                <h3 className="text-[11px] font-semibold text-text truncate">
                  Install App
                </h3>
                <p className="text-[9px] text-text-light leading-tight line-clamp-1">
                  Quick access & offline
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-0.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation min-h-[24px] min-w-[24px] flex items-center justify-center"
                aria-label="Dismiss"
              >
                <X className="h-2.5 w-2.5 text-gray-500" />
              </button>
            </div>
            <div className="flex gap-1">
              <Button
                onClick={handleInstall}
                className="flex-1 touch-manipulation min-h-[28px] text-[9px] px-2 py-0.5 h-auto"
                size="sm"
              >
                <Download className="h-2.5 w-2.5 mr-0.5" />
                Install
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="touch-manipulation min-h-[28px] text-[9px] px-2 py-0.5 h-auto"
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

