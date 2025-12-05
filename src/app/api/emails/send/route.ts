import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

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
        { error: "Either text or html content is required" },
        { status: 400 },
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log("📨 [EmailAPI] Sending email", {
        requestId,
        hasText: !!text,
        hasHtml: !!html,
      });
    }

    await sendEmail({
      subject,
      text,
      html,
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
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


