'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://admin.greenwoodscity.in';
const FIRST_VISIT_KEY = 'push-notification-first-visit';

/**
 * Push Notification Button Component
 * Handles subscribing and unsubscribing from push notifications via Strapi API
 * Auto-prompts on first visit
 */
export default function PushNotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedFirstVisit, setHasCheckedFirstVisit] = useState(false);

  useEffect(() => {
    // Check if browser supports push notifications
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      initializePushNotifications();
    }
  }, []);

  async function initializePushNotifications() {
    try {
      // First check subscription status
      const subscriptionStatus = await checkSubscription();
      setHasCheckedFirstVisit(true);

      // Then check if this is first visit and auto-prompt if needed
      await checkFirstVisit(subscriptionStatus);
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      setHasCheckedFirstVisit(true);
    }
  }

  async function checkFirstVisit(isCurrentlySubscribed: boolean) {
    try {
      const hasVisitedBefore = localStorage.getItem(FIRST_VISIT_KEY);

      // If first visit and not subscribed, auto-prompt
      if (!hasVisitedBefore && !isCurrentlySubscribed) {
        // Mark as visited immediately to prevent multiple prompts
        localStorage.setItem(FIRST_VISIT_KEY, 'true');
        
        // Small delay to ensure service worker is ready and UI is rendered
        setTimeout(() => {
          subscribeToPush();
        }, 1500);
      }
    } catch (error) {
      console.error('Error checking first visit:', error);
    }
  }

  async function checkSubscription(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      const subscribed = !!subscription;
      setIsSubscribed(subscribed);
      return subscribed;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }

  /**
   * Convert VAPID key from base64 URL to Uint8Array
   * Required for push subscription
   */
  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Convert ArrayBuffer to base64 string
   * Used for extracting keys from push subscription
   */
  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  async function subscribeToPush() {
    setIsLoading(true);
    try {
      // 1. Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // 2. Get VAPID public key from Strapi
      const keyResponse = await fetch(`${STRAPI_URL}/api/push-subscriptions/public-key`);
      if (!keyResponse.ok) {
        throw new Error('Failed to get VAPID public key');
      }
      
      const { data } = await keyResponse.json();
      const vapidPublicKey = data.publicKey;

      if (!vapidPublicKey) {
        throw new Error('VAPID public key not found in response');
      }

      // 3. Convert VAPID key to Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      // 4. Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Notification permission denied. Please enable notifications in your browser settings.');
        setIsLoading(false);
        return;
      }

      // 5. Subscribe to push notifications
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      // 6. Extract keys from subscription
      const p256dhKey = pushSubscription.getKey('p256dh');
      const authKey = pushSubscription.getKey('auth');

      if (!p256dhKey || !authKey) {
        throw new Error('Failed to extract subscription keys');
      }

      const keys = {
        p256dh: arrayBufferToBase64(p256dhKey),
        auth: arrayBufferToBase64(authKey)
      };

      // 7. Send subscription to Strapi
      const response = await fetch(`${STRAPI_URL}/api/push-subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            endpoint: pushSubscription.endpoint,
            keys: keys,
            device: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
            userAgent: navigator.userAgent
          }
        })
      });

      if (response.ok) {
        setIsSubscribed(true);
        console.log('Successfully subscribed to push notifications');
        alert('Successfully subscribed to push notifications!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to save subscription');
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to subscribe to push notifications: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribeFromPush() {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Optionally, delete from Strapi
        try {
          const response = await fetch(`${STRAPI_URL}/api/push-subscriptions`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              data: {
                endpoint: subscription.endpoint
              }
            })
          });

          if (!response.ok) {
            console.warn('Failed to delete subscription from server, but local unsubscribe succeeded');
          }
        } catch (error) {
          console.error('Error deleting subscription from server:', error);
        }

        setIsSubscribed(false);
        console.log('Successfully unsubscribed from push notifications');
        alert('Unsubscribed from push notifications');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to unsubscribe from push notifications: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) {
    return null; // Don't show if not supported
  }

  return (
    <Button
      onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
      disabled={isLoading || !hasCheckedFirstVisit}
      variant="ghost"
      size="icon"
      className="touch-target tap-feedback"
      aria-label={isSubscribed ? 'Disable push notifications' : 'Enable push notifications'}
    >
      {isLoading ? (
        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isSubscribed ? (
        <BellOff className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
      ) : (
        <Bell className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
      )}
    </Button>
  );
}

