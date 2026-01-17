import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const requestId = Math.random().toString(36).slice(2, 10);

  try {
    const strapiUrl = process.env.STRAPI_URL;

    if (!strapiUrl) {
      console.error("❌ [EventInterestsAPI] STRAPI_URL not configured", { requestId });
      return NextResponse.json(
        { 
          success: false,
          error: "Server configuration error: STRAPI_URL not set" 
        },
        { status: 500 },
      );
    }

    // Use the custom endpoint: GET /api/event-interests/event/:eventId
    const endpoint = `${strapiUrl}/api/event-interests/event/${eventId}`;

    if (process.env.NODE_ENV === "development") {
      console.log("🔍 [EventInterestsAPI] Fetching interests from Strapi", {
        requestId,
        endpoint,
        eventId,
      });
    }

    const strapiResponse = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Use no-store in production to avoid caching issues
      cache: process.env.NODE_ENV === "production" ? "no-store" : "default",
      next: process.env.NODE_ENV === "production" ? undefined : { revalidate: 30 },
    });

    let responseData;
    try {
      responseData = await strapiResponse.json();
    } catch (parseError) {
      const errorText = await strapiResponse.text().catch(() => "Unable to read response");
      console.error("❌ [EventInterestsAPI] JSON parse error", {
        requestId,
        status: strapiResponse.status,
        errorText: errorText.substring(0, 200),
      });
      return NextResponse.json(
        { 
          success: false,
          error: `Invalid response from server: ${strapiResponse.status}` 
        },
        { status: 500 },
      );
    }

    if (!strapiResponse.ok) {
      console.error("❌ [EventInterestsAPI] Strapi error", {
        requestId,
        status: strapiResponse.status,
        statusText: strapiResponse.statusText,
        endpoint,
        error: responseData,
      });

      return NextResponse.json(
        { 
          success: false,
          error: responseData.error?.message || `Failed to fetch event interests: ${strapiResponse.status} ${strapiResponse.statusText}` 
        },
        { status: strapiResponse.status },
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log("✅ [EventInterestsAPI] Success", {
        requestId,
        interestsCount: responseData.data?.interests?.length || 0,
        summary: responseData.data?.summary,
      });
    }

    // Return the structured response from Strapi
    return NextResponse.json({
      success: true,
      data: responseData.data || {
        event: null,
        interests: [],
        summary: {
          totalHouses: 0,
          totalAttendees: 0,
          averageAttendeesPerHouse: "0",
        },
      },
    });
  } catch (error) {
    console.error("❌ [EventInterestsAPI] Unexpected error", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}

