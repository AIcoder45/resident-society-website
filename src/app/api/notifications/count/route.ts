import { NextResponse } from "next/server";
import { getNotifications } from "@/lib/api";

/**
 * API route to get count of notifications added today
 */
export async function GET() {
  try {
    const notifications = await getNotifications();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayNotifications = notifications.filter((notification) => {
      const notificationDate = new Date(notification.createdAt);
      notificationDate.setHours(0, 0, 0, 0);
      return notificationDate.getTime() === today.getTime();
    });
    
    return NextResponse.json({ count: todayNotifications.length });
  } catch (error) {
    console.error("Error fetching notification count:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}

