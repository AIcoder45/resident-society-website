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
        { error: "Server configuration error: STRAPI_URL not set" },
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
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    const responseData = await strapiResponse.json().catch(() => ({}));

    if (!strapiResponse.ok) {
      console.error("❌ [EventInterestsAPI] Strapi error", {
        requestId,
        status: strapiResponse.status,
        error: responseData,
      });

      return NextResponse.json(
        { error: "Failed to fetch event interests" },
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
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}

