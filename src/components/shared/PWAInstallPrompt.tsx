"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Share2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toastSuccess, toastInfo, toastError } from "@/lib/utils/toast";

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
  const [showIOSInstructions, setShowIOSInstructions] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);

  React.useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Detect iOS
    const iosCheck = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iosCheck);

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

    // Listen for app installed event (Android/Chrome)
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setShowIOSInstructions(false);
      toastSuccess("App installed!", "The app has been added to your home screen.");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // For iOS Safari, show manual install instructions after delay
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (iosCheck && isSafari) {
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

    // Periodic check for installation status (useful for iOS)
    const checkInstallationStatus = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      
      if (isStandalone || isIOSStandalone) {
        setIsInstalled(true);
        setShowPrompt(false);
        setShowIOSInstructions(false);
        // Only show toast if we detect installation (not on initial load)
        if (!window.matchMedia("(display-mode: standalone)").matches && 
            !(window.navigator as any).standalone) {
          // This won't run on initial check, only on subsequent checks
        }
      }
    };

    // Check on page visibility change (user might have installed and returned)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
        const isIOSStandalone = (window.navigator as any).standalone === true;
        
        if (isStandalone || isIOSStandalone) {
          setIsInstalled(true);
          setShowPrompt(false);
          setShowIOSInstructions(false);
          toastSuccess("App installed!", "Welcome! The app is now installed on your device.");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial check (silent, no toast)
    checkInstallationStatus();

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
          toastSuccess("App installed!", "The app has been added to your home screen.");
          // Clear deferred prompt after successful installation
          setDeferredPrompt(null);
        } else {
          // User dismissed, hide prompt
          setShowPrompt(false);
          setDeferredPrompt(null);
        }
      } else if (isIOS) {
        // For iOS Safari, show visual instructions
        setShowPrompt(false);
        setShowIOSInstructions(true);
        toastInfo("Installation Instructions", "Follow the steps shown below to add the app to your home screen.");
      } else {
        // For Android browsers without beforeinstallprompt
        setShowPrompt(false);
        toastInfo("Installation Instructions", "Tap the menu (⋮) → Select 'Add to Home Screen' or 'Install App'");
      }
    } catch (error) {
      console.error("Error installing PWA:", error);
      // Fallback: show manual instructions
      if (isIOS) {
        setShowPrompt(false);
        setShowIOSInstructions(true);
        toastError("Installation failed", "Please follow the manual steps shown below.");
      } else {
        toastError("Installation failed", "Please try installing from the browser menu.");
      }
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    // Remember dismissal for this session
    sessionStorage.setItem("pwa-install-dismissed", "true");
  };

  const handleCloseIOSInstructions = () => {
    setShowIOSInstructions(false);
    sessionStorage.setItem("pwa-install-dismissed", "true");
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // iOS Installation Instructions Modal
  if (showIOSInstructions) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[60] flex items-end lg:hidden"
          onClick={handleCloseIOSInstructions}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-t-2xl w-full max-w-md mx-auto safe-area-inset-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text">Install App</h3>
                <button
                  onClick={handleCloseIOSInstructions}
                  className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text font-medium mb-1">Tap the Share button</p>
                    <p className="text-xs text-text-light">Look for the share icon at the bottom of Safari</p>
                    <div className="mt-2 flex items-center gap-2 text-primary">
                      <Share2 className="h-4 w-4" />
                      <span className="text-xs">Share icon</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text font-medium mb-1">Select "Add to Home Screen"</p>
                    <p className="text-xs text-text-light">Scroll down in the share menu to find this option</p>
                    <div className="mt-2 flex items-center gap-2 text-primary">
                      <Plus className="h-4 w-4" />
                      <span className="text-xs">Add to Home Screen</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text font-medium mb-1">Tap "Add"</p>
                    <p className="text-xs text-text-light">Confirm the installation to add the app icon to your home screen</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCloseIOSInstructions}
                className="w-full mt-6 touch-manipulation"
                size="sm"
              >
                Got it!
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Don't show prompt if dismissed this session
  if (
    !showPrompt ||
    (typeof window !== "undefined" && sessionStorage.getItem("pwa-install-dismissed") === "true")
  ) {
    return null;
  }

  // Only show if we have deferredPrompt (Android/Chrome) or on iOS Safari
  if (typeof window !== "undefined") {
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

