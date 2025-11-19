import { NextRequest, NextResponse } from "next/server";

/**
 * Contact Form API Route
 * Handles contact form submissions
 * Can store in Strapi or send via email service
 */

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Try to store in Strapi if available
    const strapiUrl = process.env.STRAPI_URL;
    const apiToken = process.env.STRAPI_API_TOKEN;

    if (strapiUrl && apiToken) {
      try {
        // Check if contact-submissions collection exists in Strapi
        const response = await fetch(`${strapiUrl}/api/contact-submissions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
          },
          body: JSON.stringify({
            data: {
              name: body.name,
              email: body.email,
              phone: body.phone || null,
              subject: body.subject,
              message: body.message,
              submittedAt: new Date().toISOString(),
            },
          }),
        });

        if (response.ok) {
          return NextResponse.json({
            success: true,
            message: "Contact form submitted successfully",
          });
        }
      } catch (strapiError) {
        // If Strapi fails, fall through to email or log
        console.error("Strapi submission error:", strapiError);
      }
    }

    // Fallback: Log the submission (in production, you might want to send an email)
    console.log("Contact form submission:", {
      name: body.name,
      email: body.email,
      phone: body.phone,
      subject: body.subject,
      message: body.message,
      timestamp: new Date().toISOString(),
    });

    // In a real application, you would send an email here using a service like:
    // - SendGrid
    // - Resend
    // - Nodemailer with SMTP
    // - AWS SES

    return NextResponse.json({
      success: true,
      message: "Contact form submitted successfully",
    });
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to process contact form submission" },
      { status: 500 }
    );
  }
}

