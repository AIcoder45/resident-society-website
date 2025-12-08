import { NextRequest, NextResponse } from "next/server";

/**
 * Push Subscription API Route
 * Handles subscribing and unsubscribing from push notifications
 */

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

    if (!apiToken) {
      console.error("STRAPI_API_TOKEN not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

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
      const errorText = await response.text();
      console.error("Failed to save subscription:", errorText);
      throw new Error("Failed to save subscription");
    }

    // Send test notification
    try {
      const webpush = (await import("web-push")).default;

      // Temporary server-side debug for VAPID configuration.
      // Check your server logs (not browser console) to verify these.
      // Remove this once you have confirmed values.
      // eslint-disable-next-line no-console
      console.log("VAPID config (server)", {
        hasPublic: !!process.env.VAPID_PUBLIC_KEY,
        hasPrivate: !!process.env.VAPID_PRIVATE_KEY,
        email: process.env.VAPID_EMAIL,
      });

      webpush.setVapidDetails(
        process.env.VAPID_EMAIL || "mailto:notifications@greenwoodcity.com",
        process.env.VAPID_PUBLIC_KEY || "",
        process.env.VAPID_PRIVATE_KEY || ""
      );

      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: "Welcome!",
          body: "Push notifications are now enabled for Greenwood City Block C.",
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          data: {
            url: "/",
          },
        })
      );
    } catch (error) {
      console.error("Test notification error:", error);
      // Don't fail the subscription if test notification fails
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
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

    if (!apiToken) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

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
  } catch (error: any) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}

