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
    // Note: Service workers require HTTPS (or localhost) to work
    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator
    ) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });

          console.log("✅ Service Worker registered successfully:", registration.scope);

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("🔄 New service worker available");
                }
              });
            }
          });

          // Log service worker state changes
          if (registration.installing) {
            console.log("Service worker installing...");
          } else if (registration.waiting) {
            console.log("Service worker waiting...");
          } else if (registration.active) {
            console.log("Service worker active");
          }
        } catch (error) {
          console.error("❌ Service Worker registration failed:", error);
          // Log additional details for debugging
          if (error instanceof Error) {
            console.error("Error details:", {
              message: error.message,
              stack: error.stack,
            });
          }
        }
      };

      registerServiceWorker();
    } else if (process.env.NODE_ENV === "development") {
      console.log("ℹ️ Service Worker disabled in development mode");
    } else if (!("serviceWorker" in navigator)) {
      console.warn("⚠️ Service Workers are not supported in this browser");
    }
  }, []);

  return null;
}

