import { NextRequest, NextResponse } from "next/server";

interface EventInterestRequestBody {
  data: {
    event: number | string; // Can be number or string (will convert to number)
    houseNo: string;
    floorNo: string;
    name?: string | null;
    mobileNo?: string | null;
    numberOfMembers?: number; // Number of members coming (optional, defaults to 1, min: 1)
    showInterest?: boolean;
  };
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).slice(2, 10);

  try {
    const body: EventInterestRequestBody = await request.json();

    if (!body || typeof body !== "object" || !body.data) {
      console.warn("⚠️ [EventInterestAPI] Invalid JSON body", { requestId });
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { data } = body;

    // Validate required fields
    if (!data.event || !data.houseNo || !data.floorNo) {
      return NextResponse.json(
        { error: "Missing required fields: event, houseNo, and floorNo are required" },
        { status: 400 },
      );
    }

    const strapiUrl = process.env.STRAPI_URL;

    if (!strapiUrl) {
      console.error("❌ [EventInterestAPI] STRAPI_URL not configured", { requestId });
      return NextResponse.json(
        { error: "Server configuration error: STRAPI_URL not set" },
        { status: 500 },
      );
    }

    const endpoint = `${strapiUrl}/api/event-interests`;

    // Prepare request body matching API documentation format
    // Convert event to number, set optional fields to null if empty
    const requestData = {
      event: typeof data.event === "string" ? parseInt(data.event, 10) : data.event,
      houseNo: data.houseNo,
      floorNo: data.floorNo,
      name: data.name && data.name.trim() ? data.name : null,
      mobileNo: data.mobileNo && data.mobileNo.trim() ? data.mobileNo : null,
      numberOfMembers: data.numberOfMembers && data.numberOfMembers >= 1 ? data.numberOfMembers : 1,
      showInterest: data.showInterest !== undefined ? data.showInterest : true,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("📨 [EventInterestAPI] Proxying request to Strapi", {
        requestId,
        endpoint,
        event: requestData.event,
        houseNo: requestData.houseNo,
      });
    }

    const strapiResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: requestData }),
    });

    const responseData = await strapiResponse.json().catch(() => ({}));

    if (!strapiResponse.ok) {
      console.error("❌ [EventInterestAPI] Strapi error", {
        requestId,
        status: strapiResponse.status,
        error: responseData,
      });

      const errorMessage =
        responseData.error?.message ||
        responseData.error?.details?.errors?.[0]?.message ||
        `Failed to submit event interest: ${strapiResponse.status} ${strapiResponse.statusText}`;

      return NextResponse.json(
        { error: errorMessage },
        { status: strapiResponse.status },
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log("✅ [EventInterestAPI] Success", { requestId });
    }

    return NextResponse.json({
      success: true,
      data: responseData.data || responseData,
    });
  } catch (error) {
    console.error("❌ [EventInterestAPI] Unexpected error", {
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

