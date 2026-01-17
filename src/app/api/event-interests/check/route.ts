import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).slice(2, 10);
  const searchParams = request.nextUrl.searchParams;
  const eventId = searchParams.get("eventId");
  const houseNo = searchParams.get("houseNo") || searchParams.get("houseNumber"); // Support both for backward compatibility
  const floorNo = searchParams.get("floorNo") || searchParams.get("floorNumber"); // Support both for backward compatibility

  try {
    if (!eventId || !houseNo || !floorNo) {
      return NextResponse.json(
        { error: "Missing required parameters: eventId, houseNo, and floorNo are required" },
        { status: 400 },
      );
    }

    const strapiUrl = process.env.STRAPI_URL;

    if (!strapiUrl) {
      console.error("❌ [EventInterestCheckAPI] STRAPI_URL not configured", { requestId });
      return NextResponse.json(
        { error: "Server configuration error: STRAPI_URL not set" },
        { status: 500 },
      );
    }

    const endpoint = `${strapiUrl}/api/event-interests/check?eventId=${eventId}&houseNo=${encodeURIComponent(houseNo)}&floorNo=${encodeURIComponent(floorNo)}`;

    if (process.env.NODE_ENV === "development") {
      console.log("🔍 [EventInterestCheckAPI] Checking existing interest", {
        requestId,
        endpoint,
        eventId,
        houseNo,
        floorNo,
      });
    }

    const strapiResponse = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 }, // Don't cache check requests
    });

    const responseData = await strapiResponse.json().catch(() => ({}));

    if (!strapiResponse.ok) {
      // If 404, it means no existing interest (which is fine)
      if (strapiResponse.status === 404) {
        return NextResponse.json({
          success: true,
          data: {
            exists: false,
            interest: null,
          },
        });
      }

      console.error("❌ [EventInterestCheckAPI] Strapi error", {
        requestId,
        status: strapiResponse.status,
        error: responseData,
      });

      return NextResponse.json(
        { error: "Failed to check event interest" },
        { status: strapiResponse.status },
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log("✅ [EventInterestCheckAPI] Success", {
        requestId,
        exists: responseData.data?.exists || false,
      });
    }

    return NextResponse.json({
      success: true,
      data: responseData.data || {
        exists: false,
        interest: null,
      },
    });
  } catch (error) {
    console.error("❌ [EventInterestCheckAPI] Unexpected error", {
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

