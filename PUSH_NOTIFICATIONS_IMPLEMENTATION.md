# Push Notifications Implementation Guide

This guide explains how to implement push notifications using Strapi as the backend and Next.js as the frontend.

## 🎯 Architecture Overview

```
Strapi (Backend) → Webhook/API → Next.js API Route → Service Worker → User Device
```

### Flow:
1. Content changes in Strapi
2. Strapi webhook triggers notification
3. Next.js API route sends push notification
4. Service Worker receives push
5. User sees notification

---

## 📋 Prerequisites

### Required:
- ✅ Strapi backend running
- ✅ Next.js app with service worker
- ✅ HTTPS (required for push notifications)
- ✅ VAPID keys (for web push)

### Optional:
- Firebase Cloud Messaging (FCM) - Alternative to VAPID
- OneSignal - Third-party service

---

## 🔧 Step 1: Generate VAPID Keys

VAPID keys are required for web push notifications.

### Generate Keys:
```bash
npm install -g web-push
web-push generate-vapid-keys
```

**Output:**
```
Public Key: BKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Private Key: yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

**Save these keys** - you'll need them in both Strapi and Next.js.

---

## 🎨 Step 2: Strapi Configuration

### 2.1 Install Strapi Plugin (Optional)

Create a custom Strapi plugin or use webhooks.

### 2.2 Create Push Subscription Collection Type

**In Strapi Admin → Content-Type Builder:**

Create a new collection type: `push-subscription`

**Fields:**
- `endpoint` (Text, Required)
- `keys` (JSON, Required)
  - `p256dh` (Text)
  - `auth` (Text)
- `user` (Relation, User - optional)
- `device` (Text - optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### 2.3 Create Webhook (Strapi Admin)

**Settings → Webhooks → Create New Webhook**

**Trigger:**
- Entry create
- Entry update
- Entry delete

**URL:** `https://your-nextjs-app.com/api/webhooks/strapi`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_STRAPI_API_TOKEN"
}
```

### 2.4 Create Strapi Plugin for Push Notifications

**File: `src/plugins/push-notification/config/functions/webhook.js`**

```javascript
'use strict';

const webpush = require('web-push');

module.exports = {
  async sendPushNotification(event, strapi) {
    const { model, action, result } = event;
    
    // Configure VAPID keys
    webpush.setVapidDetails(
      'mailto:your-email@example.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    // Get all push subscriptions
    const subscriptions = await strapi.entityService.findMany(
      'plugin::push-subscription.subscription',
      {}
    );

    // Prepare notification payload
    const payload = JSON.stringify({
      title: `${model} ${action}`,
      body: `New ${model} has been ${action}d`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: {
        url: `/api/webhooks/strapi/${model}/${result.id}`,
        model,
        action,
        id: result.id
      }
    });

    // Send to all subscriptions
    const promises = subscriptions.map(subscription => {
      return webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth
          }
        },
        payload
      ).catch(error => {
        console.error('Push notification error:', error);
        // Remove invalid subscriptions
        if (error.statusCode === 410) {
          strapi.entityService.delete(
            'plugin::push-subscription.subscription',
            subscription.id
          );
        }
      });
    });

    await Promise.all(promises);
  }
};
```

---

## 🚀 Step 3: Next.js Implementation

### 3.1 Install Dependencies

```bash
npm install web-push
npm install @types/web-push --save-dev
```

### 3.2 Environment Variables

**`.env.local`:**
```env
VAPID_PUBLIC_KEY=your-public-key-here
VAPID_PRIVATE_KEY=your-private-key-here
VAPID_EMAIL=your-email@example.com
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-strapi-api-token
```

### 3.3 Create Push Subscription API Route

**File: `src/app/api/push/subscribe/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

// Configure VAPID
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || "mailto:your-email@example.com",
  process.env.VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Invalid subscription" },
        { status: 400 }
      );
    }

    // Store subscription in Strapi
    const strapiUrl = process.env.STRAPI_URL || "http://localhost:1337";
    const apiToken = process.env.STRAPI_API_TOKEN;

    const response = await fetch(`${strapiUrl}/api/push-subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        data: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save subscription");
    }

    // Send test notification
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: "Welcome!",
          body: "Push notifications are now enabled.",
          icon: "/icon-192.png",
          badge: "/icon-192.png",
        })
      );
    } catch (error) {
      console.error("Test notification error:", error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint required" },
        { status: 400 }
      );
    }

    // Delete subscription from Strapi
    const strapiUrl = process.env.STRAPI_URL || "http://localhost:1337";
    const apiToken = process.env.STRAPI_API_TOKEN;

    // Find subscription by endpoint
    const findResponse = await fetch(
      `${strapiUrl}/api/push-subscriptions?filters[endpoint][$eq]=${encodeURIComponent(endpoint)}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    const findData = await findResponse.json();
    if (findData.data && findData.data.length > 0) {
      const subscriptionId = findData.data[0].id;
      await fetch(`${strapiUrl}/api/push-subscriptions/${subscriptionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
```

### 3.4 Create Webhook Handler

**File: `src/app/api/webhooks/strapi/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || "mailto:your-email@example.com",
  process.env.VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

export async function POST(request: NextRequest) {
  try {
    // Verify webhook token (optional but recommended)
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.STRAPI_API_TOKEN;

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const event = await request.json();
    const { model, action, entry } = event;

    // Get all push subscriptions from Strapi
    const strapiUrl = process.env.STRAPI_URL || "http://localhost:1337";
    const apiToken = process.env.STRAPI_API_TOKEN;

    const subscriptionsResponse = await fetch(
      `${strapiUrl}/api/push-subscriptions`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    const subscriptionsData = await subscriptionsResponse.json();
    const subscriptions = subscriptionsData.data || [];

    if (subscriptions.length === 0) {
      return NextResponse.json({ message: "No subscriptions" });
    }

    // Prepare notification payload
    const modelName = model.replace("api::", "").replace("::", " ");
    const actionText = action === "create" ? "created" : action === "update" ? "updated" : "deleted";
    
    const payload = JSON.stringify({
      title: `${modelName.charAt(0).toUpperCase() + modelName.slice(1)} ${actionText}`,
      body: entry?.title || entry?.name || `New ${modelName} has been ${actionText}`,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      image: entry?.image?.url || entry?.coverImage?.url || undefined,
      data: {
        url: getContentUrl(model, entry),
        model,
        action,
        id: entry?.id,
      },
      tag: `${model}-${action}-${entry?.id}`,
      requireInteraction: false,
    });

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub: any) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
              },
            },
            payload
          );
          return { success: true, id: sub.id };
        } catch (error: any) {
          console.error(`Push error for subscription ${sub.id}:`, error);
          
          // Remove invalid subscriptions (410 = Gone)
          if (error.statusCode === 410) {
            await fetch(`${strapiUrl}/api/push-subscriptions/${sub.id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${apiToken}`,
              },
            });
          }
          
          return { success: false, id: sub.id, error: error.message };
        }
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
    const failed = results.length - successful;

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      total: subscriptions.length,
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

function getContentUrl(model: string, entry: any): string {
  // Map Strapi models to your app routes
  const routeMap: Record<string, string> = {
    "api::news.news": `/news/${entry.slug}`,
    "api::event.event": `/events/${entry.slug}`,
    "api::notification.notification": `/notifications`,
    "api::policy.policy": `/policies/${entry.slug}`,
    "api::advertisement.advertisement": `/advertisements/${entry.id}`,
  };

  return routeMap[model] || "/";
}
```

### 3.5 Update Service Worker

**File: `public/sw.js`** - Add push event handler:

```javascript
// ... existing code ...

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received');

  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'New Update',
        body: event.data.text() || 'You have a new notification',
      };
    }
  }

  const options = {
    title: data.title || 'Greenwood City Block C',
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    image: data.image,
    data: data.data || {},
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      {
        action: 'open',
        title: 'View',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
```

### 3.6 Create Push Notification Component

**File: `src/components/shared/PushNotificationManager.tsx`**

```typescript
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner"; // Or your toast library

export function PushNotificationManager() {
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
        toast.error("Notification permission denied");
        setIsLoading(false);
        return;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
        ),
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
        toast.success("Push notifications enabled!");
      } else {
        throw new Error("Failed to subscribe");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to enable push notifications");
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
        await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
          method: "DELETE",
        });

        setIsSubscribed(false);
        toast.success("Push notifications disabled");
      }
    } catch (error) {
      console.error("Unsubscribe error:", error);
      toast.error("Failed to disable push notifications");
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
      className="touch-target tap-feedback"
      size="sm"
    >
      {isSubscribed ? (
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

// Convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

### 3.7 Add to Layout

**File: `src/app/layout.tsx`** - Add component:

```typescript
import { PushNotificationManager } from "@/components/shared/PushNotificationManager";

// In your header or settings page
<PushNotificationManager />
```

### 3.8 Environment Variables

**`.env.local`:**
```env
# VAPID Keys
VAPID_PUBLIC_KEY=your-public-key-here
VAPID_PRIVATE_KEY=your-private-key-here
VAPID_EMAIL=your-email@example.com

# Public VAPID key (for client-side)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key-here

# Strapi
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-strapi-api-token
```

---

## 📝 Step 4: Strapi Configuration

### 4.1 Create Push Subscription Content Type

**In Strapi Admin:**
1. Content-Type Builder → Create new collection type
2. Name: `push-subscription`
3. Add fields:
   - `endpoint` (Text, Required)
   - `keys` (JSON, Required)
   - `user` (Relation to User, Optional)
   - `device` (Text, Optional)

### 4.2 Configure Permissions

**Settings → Roles → Public:**
- Allow `find` and `create` for `push-subscription`

**Settings → Roles → Authenticated:**
- Allow `find`, `create`, `delete` for `push-subscription`

### 4.3 Create Webhook

**Settings → Webhooks → Create:**
- **Name**: Content Updates
- **URL**: `https://your-domain.com/api/webhooks/strapi`
- **Events**: Entry create, update, delete
- **Headers**: `Authorization: Bearer YOUR_API_TOKEN`

---

## 🧪 Testing

### 1. Test Subscription
1. Visit your app
2. Click "Enable Notifications"
3. Grant permission
4. Should see "Push notifications enabled!"

### 2. Test Notification
1. Create/update content in Strapi
2. Webhook should trigger
3. Notification should appear

### 3. Debug
- Chrome DevTools → Application → Service Workers
- Check push subscription
- Check console for errors

---

## 🎯 Summary

### What's Needed in Strapi:
1. ✅ Push Subscription collection type
2. ✅ Webhook configuration
3. ✅ API token for authentication

### What's Needed in Next.js:
1. ✅ VAPID keys configuration
2. ✅ Push subscription API route
3. ✅ Webhook handler
4. ✅ Service worker push handler
5. ✅ Push notification manager component

### Benefits:
- ✅ Real-time notifications
- ✅ Works when app is closed
- ✅ Content change alerts
- ✅ User engagement

---

## 📚 Resources

- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [VAPID Protocol](https://tools.ietf.org/html/rfc8292)
- [Strapi Webhooks](https://docs.strapi.io/dev-docs/backend-customization/webhooks)



