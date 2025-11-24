"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toastSuccess, toastError } from "@/lib/utils/toast";

interface PushNotificationManagerProps {
  className?: string;
}

/**
 * Push Notification Manager Component
 * Handles subscribing and unsubscribing from push notifications
 */
export function PushNotificationManager({ className }: PushNotificationManagerProps) {
  const [isSupported, setIsSupported] = React.useState(false);
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // Check if push notifications are supported
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      setIsSupported(true);
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const subscribe = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toastError("Notification permission denied", "Please enable notifications in your browser settings.");
        setIsLoading(false);
        return;
      }

      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error("VAPID public key not configured");
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to server
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      if (response.ok) {
        setIsSubscribed(true);
        toastSuccess("Push notifications enabled!", "You'll now receive important updates.");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to subscribe");
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toastError("Failed to enable push notifications", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove from server
        const response = await fetch(
          `/api/push/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setIsSubscribed(false);
          toastSuccess("Push notifications disabled", "You won't receive push notifications anymore.");
        } else {
          throw new Error("Failed to unsubscribe from server");
        }
      }
    } catch (error: any) {
      console.error("Unsubscribe error:", error);
      toastError("Failed to disable push notifications", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null; // Don't show if not supported
  }

  return (
    <Button
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isLoading}
      variant={isSubscribed ? "outline" : "default"}
      className={cn("touch-target tap-feedback", className)}
      size="sm"
      aria-label={isSubscribed ? "Disable push notifications" : "Enable push notifications"}
    >
      {isLoading ? (
        <>
          <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {isSubscribed ? "Disabling..." : "Enabling..."}
        </>
      ) : isSubscribed ? (
        <>
          <BellOff className="h-4 w-4 mr-2" />
          Disable Notifications
        </>
      ) : (
        <>
          <Bell className="h-4 w-4 mr-2" />
          Enable Notifications
        </>
      )}
    </Button>
  );
}

/**
 * Convert VAPID key from base64 URL to Uint8Array
 * Required for push subscription
 */
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

