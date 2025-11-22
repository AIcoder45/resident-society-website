import { NextResponse } from "next/server";
import { getEvents } from "@/lib/api";

/**
 * API route to get upcoming events for header marquee
 */
export async function GET() {
  try {
    const events = await getEvents(5, true); // Get up to 5 upcoming events
    
    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}

