import { NextRequest, NextResponse } from "next/server";

/**
 * Strapi Webhook Handler
 * Receives webhooks from Strapi when content changes
 * Sends push notifications to all subscribed users
 */

// Initialize VAPID details only if keys are provided
function initializeVapid() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL || "mailto:notifications@greenwoodcity.com";
  
  // Only set VAPID details if both keys are provided
  if (publicKey && privateKey && publicKey.trim() !== "" && privateKey.trim() !== "") {
    const webpush = require("web-push");
    webpush.setVapidDetails(email, publicKey, privateKey);
    return webpush;
  }
  return null;
}

// Map Strapi models to app routes
function getContentUrl(model: string, entry: any): string {
  const routeMap: Record<string, string> = {
    "api::news.news": `/news/${entry.slug || entry.id}`,
    "api::event.event": `/events/${entry.slug || entry.id}`,
    "api::notification.notification": `/notifications`,
    "api::advertisement.advertisement": `/advertisements/${entry.id}`,
    "api::rwa.rwa": `/rwa`,
  };

  return routeMap[model] || "/";
}

// Get content title/name
function getContentTitle(model: string, entry: any): string {
  return entry?.title || entry?.name || entry?.heroTitleText || `New ${model.replace("api::", "").replace(".", " ")}`;
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook token (optional but recommended)
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.STRAPI_API_TOKEN;

    // If the server isn't configured with a token, return a clearer error
    if (!expectedToken) {
      console.error("Webhook error: STRAPI_API_TOKEN is not set in the environment");
      return NextResponse.json(
        { error: "Server token not configured" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Initialize VAPID (only if keys are provided)
    const webpush = initializeVapid();
    if (!webpush) {
      console.warn("VAPID keys not configured. Push notifications disabled.");
      return NextResponse.json(
        { message: "Push notifications not configured" },
        { status: 200 }
      );
    }

    const event = await request.json();
    const { model, action, entry } = event;

    console.log(`Webhook received: ${model} ${action}`, entry?.id);

    // Get all push subscriptions from Strapi
    const strapiUrl = process.env.STRAPI_URL || "http://localhost:1337";
    const apiToken = process.env.STRAPI_API_TOKEN;

    const subscriptionsResponse = await fetch(
      `${strapiUrl}/api/push-subscriptions?pagination[limit]=1000`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    const subscriptionsData = await subscriptionsResponse.json();
    const rawSubscriptions = subscriptionsData?.data ?? [];

    // Normalize Strapi subscription format: { id, attributes: { endpoint, keys } }
    const subscriptions = rawSubscriptions
      .map((sub: any) => {
        const attributes = sub?.attributes;
        if (!attributes?.endpoint || !attributes?.keys) {
          console.warn("Push subscription missing endpoint/keys, skipping", {
            id: sub?.id,
          });
          return null;
        }

        return {
          id: sub.id,
          endpoint: attributes.endpoint,
          keys: attributes.keys,
        };
      })
      .filter((sub: any) => sub !== null);

    if (subscriptions.length === 0) {
      console.log("No valid push subscriptions found");
      return NextResponse.json({ message: "No subscriptions" });
    }

    // Prepare notification payload
    const modelName = model.replace("api::", "").replace(".", " ");
    const actionText = 
      action === "create" ? "created" : 
      action === "update" ? "updated" : 
      "deleted";
    
    const contentTitle = getContentTitle(model, entry);
    const contentUrl = getContentUrl(model, entry);
    
    // Get image if available
    let imageUrl: string | undefined;
    if (entry?.image?.data?.attributes?.url) {
      imageUrl = `${strapiUrl}${entry.image.data.attributes.url}`;
    } else if (entry?.coverImage?.data?.attributes?.url) {
      imageUrl = `${strapiUrl}${entry.coverImage.data.attributes.url}`;
    } else if (entry?.image?.url) {
      imageUrl = `${strapiUrl}${entry.image.url}`;
    } else if (entry?.coverImage?.url) {
      imageUrl = `${strapiUrl}${entry.coverImage.url}`;
    }

    const payload = JSON.stringify({
      title: `${modelName.charAt(0).toUpperCase() + modelName.slice(1)} ${actionText}`,
      body: contentTitle,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      image: imageUrl,
      data: {
        url: contentUrl,
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
          
          // Remove invalid subscriptions (410 = Gone, 404 = Not Found)
          if (error.statusCode === 410 || error.statusCode === 404) {
            try {
              await fetch(`${strapiUrl}/api/push-subscriptions/${sub.id}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${apiToken}`,
                },
              });
              console.log(`Removed invalid subscription ${sub.id}`);
            } catch (deleteError) {
              console.error(`Failed to delete subscription ${sub.id}:`, deleteError);
            }
          }
          
          return { success: false, id: sub.id, error: error.message };
        }
      })
    );

    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;
    const failed = results.length - successful;

    console.log(`Push notifications sent: ${successful} successful, ${failed} failed`);

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

