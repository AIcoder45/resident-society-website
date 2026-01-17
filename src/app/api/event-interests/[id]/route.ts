import { NextRequest, NextResponse } from "next/server";

interface EventInterestUpdateBody {
  data: {
    event?: number | string;
    houseNo?: string;
    floorNo?: string;
    name?: string | null;
    mobileNo?: string | null;
    numberOfMembers?: number; // Number of members coming (optional, defaults to 1, min: 1)
    showInterest?: boolean;
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const requestId = Math.random().toString(36).slice(2, 10);

  try {
    const body: EventInterestUpdateBody = await request.json();

    if (!body || typeof body !== "object" || !body.data) {
      console.warn("⚠️ [EventInterestUpdateAPI] Invalid JSON body", { requestId });
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { data } = body;

    // For PUT requests, only include fields that are provided (partial update support)
    // Build requestData object with only provided fields
    const requestData: any = {};

    // Only include fields that are provided in the request
    if (data.event !== undefined) {
      requestData.event = typeof data.event === "string" ? parseInt(data.event, 10) : data.event;
    }
    if (data.houseNo !== undefined) {
      requestData.houseNo = data.houseNo;
    }
    if (data.floorNo !== undefined) {
      requestData.floorNo = data.floorNo;
    }
    if (data.name !== undefined) {
      requestData.name = data.name && data.name.trim() ? data.name : null;
    }
    if (data.mobileNo !== undefined) {
      requestData.mobileNo = data.mobileNo && data.mobileNo.trim() ? data.mobileNo : null;
    }
    if (data.numberOfMembers !== undefined) {
      requestData.numberOfMembers = data.numberOfMembers >= 1 ? data.numberOfMembers : 1;
    }
    if (data.showInterest !== undefined) {
      requestData.showInterest = data.showInterest;
    }

    // Ensure at least one field is being updated
    if (Object.keys(requestData).length === 0) {
      return NextResponse.json(
        { error: "At least one field must be provided for update" },
        { status: 400 },
      );
    }

    const strapiUrl = process.env.STRAPI_URL;

    if (!strapiUrl) {
      console.error("❌ [EventInterestUpdateAPI] STRAPI_URL not configured", { requestId });
      return NextResponse.json(
        { error: "Server configuration error: STRAPI_URL not set" },
        { status: 500 },
      );
    }

    const endpoint = `${strapiUrl}/api/event-interests/${id}`;

    if (process.env.NODE_ENV === "development") {
      console.log("📨 [EventInterestUpdateAPI] Updating interest in Strapi", {
        requestId,
        endpoint,
        id,
        event: requestData.event,
        houseNo: requestData.houseNo,
      });
    }

    const strapiResponse = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: requestData }),
    });

    const responseData = await strapiResponse.json().catch(() => ({}));

    if (!strapiResponse.ok) {
      console.error("❌ [EventInterestUpdateAPI] Strapi error", {
        requestId,
        status: strapiResponse.status,
        error: responseData,
      });

      const errorMessage =
        responseData.error?.message ||
        responseData.error?.details?.errors?.[0]?.message ||
        `Failed to update event interest: ${strapiResponse.status} ${strapiResponse.statusText}`;

      return NextResponse.json(
        { error: errorMessage },
        { status: strapiResponse.status },
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log("✅ [EventInterestUpdateAPI] Success", { requestId });
    }

    return NextResponse.json({
      success: true,
      data: responseData.data || responseData,
    });
  } catch (error) {
    console.error("❌ [EventInterestUpdateAPI] Unexpected error", {
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const requestId = Math.random().toString(36).slice(2, 10);

  try {
    if (!id) {
      return NextResponse.json(
        { error: "Missing interest ID" },
        { status: 400 },
      );
    }

    const strapiUrl = process.env.STRAPI_URL;

    if (!strapiUrl) {
      console.error("❌ [EventInterestDeleteAPI] STRAPI_URL not configured", { requestId });
      return NextResponse.json(
        { error: "Server configuration error: STRAPI_URL not set" },
        { status: 500 },
      );
    }

    const endpoint = `${strapiUrl}/api/event-interests/${id}`;

    if (process.env.NODE_ENV === "development") {
      console.log("🗑️ [EventInterestDeleteAPI] Deleting interest from Strapi", {
        requestId,
        endpoint,
        id,
      });
    }

    const strapiResponse = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseData = await strapiResponse.json().catch(() => ({}));

    if (!strapiResponse.ok) {
      console.error("❌ [EventInterestDeleteAPI] Strapi error", {
        requestId,
        status: strapiResponse.status,
        error: responseData,
      });

      const errorMessage =
        responseData.error?.message ||
        `Failed to delete event interest: ${strapiResponse.status} ${strapiResponse.statusText}`;

      return NextResponse.json(
        { error: errorMessage },
        { status: strapiResponse.status },
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log("✅ [EventInterestDeleteAPI] Success", { requestId });
    }

    return NextResponse.json({
      data: {
        id: parseInt(id, 10),
        deleted: true,
      },
      message: "Event interest deleted successfully",
    });
  } catch (error) {
    console.error("❌ [EventInterestDeleteAPI] Unexpected error", {
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
