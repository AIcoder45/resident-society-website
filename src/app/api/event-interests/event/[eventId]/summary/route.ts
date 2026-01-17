import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const requestId = Math.random().toString(36).slice(2, 10);

  try {
    if (!eventId) {
      return NextResponse.json(
        { error: "Missing event ID" },
        { status: 400 },
      );
    }

    const strapiUrl = process.env.STRAPI_URL;

    if (!strapiUrl) {
      console.error("❌ [EventInterestSummaryAPI] STRAPI_URL not configured", { requestId });
      return NextResponse.json(
        { error: "Server configuration error: STRAPI_URL not set" },
        { status: 500 },
      );
    }

    const endpoint = `${strapiUrl}/api/event-interests/event/${eventId}/summary`;

    if (process.env.NODE_ENV === "development") {
      console.log("📊 [EventInterestSummaryAPI] Fetching summary from Strapi", {
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
      console.error("❌ [EventInterestSummaryAPI] Strapi error", {
        requestId,
        status: strapiResponse.status,
        error: responseData,
      });

      return NextResponse.json(
        { error: "Failed to fetch event summary" },
        { status: strapiResponse.status },
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log("✅ [EventInterestSummaryAPI] Success", {
        requestId,
        summary: responseData.data,
      });
    }

    return NextResponse.json({
      data: responseData.data || {
        eventId: parseInt(eventId, 10),
        eventTitle: "",
        eventDate: null,
        eventSlug: "",
        totalInterests: 0,
        totalHouses: 0,
        totalMembers: 0,
      },
    });
  } catch (error) {
    console.error("❌ [EventInterestSummaryAPI] Unexpected error", {
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
