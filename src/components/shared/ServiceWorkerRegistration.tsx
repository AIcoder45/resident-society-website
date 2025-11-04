"use client";

import * as React from "react";

/**
 * Service Worker Registration Component
 * Registers the service worker for PWA functionality
 */
export function ServiceWorkerRegistration() {
  React.useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return;
    }

    // Only register service worker in production or if explicitly enabled
    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator
    ) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });

          if (process.env.NODE_ENV === "development") {
            console.log("✅ Service Worker registered:", registration);
          }

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New service worker available
                  if (process.env.NODE_ENV === "development") {
                    console.log("🔄 New service worker available");
                  }
                }
              });
            }
          });
        } catch (error) {
          console.error("❌ Service Worker registration failed:", error);
        }
      };

      registerServiceWorker();
    }
  }, []);

  return null;
}

