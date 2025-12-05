import { NextRequest, NextResponse } from "next/server";

interface EmailRequestBody {
  subject?: string;
  text?: string;
  html?: string;
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).slice(2, 10);

  try {
    const body: EmailRequestBody = await request.json();

    if (!body || typeof body !== "object") {
      console.warn("⚠️ [EmailAPI] Invalid JSON body", { requestId });
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { subject, text, html } = body;

    if (!subject || typeof subject !== "string") {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 },
      );
    }

    if (
      (!text || typeof text !== "string") &&
      (!html || typeof html !== "string")
    ) {
      return NextResponse.json(
        { error: "Either text or html content is required " },
        { status: 400 },
      );
    }

    const endpoint =
      process.env.STRAPI_EMAIL_ENDPOINT ||
      "https://admin.greenwoodscity.in/api/emails/send";

    // Prefer STRAPI_API_TOKEN but fall back to generic API_TOKEN for auth
    const apiToken = process.env.STRAPI_API_TOKEN || process.env.API_TOKEN;

    if (process.env.NODE_ENV === "development") {
      console.log("📨 [EmailAPI] Proxying email to Strapi endpoint", {
        requestId,
        endpoint,
        hasText: !!text,
        hasHtml: !!html,
      });
    }

    const strapiResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiToken && {
          Authorization: `Bearer ${apiToken}`,
        }),
      },
      body: JSON.stringify({ subject, text, html }),
    });

    const data = await strapiResponse.json().catch(() => ({}));

    if (!strapiResponse.ok || (data && data.success === false)) {
      console.error("❌ [EmailAPI] Strapi email endpoint returned error", {
        requestId,
        status: strapiResponse.status,
        data,
      });

      return NextResponse.json(
        { error: "Failed to send email via email service" },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          data?.message || "Email sent successfully via external email service",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ [EmailAPI] Error handling request:", {
      requestId,
      error,
    });

    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}


