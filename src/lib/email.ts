import nodemailer from "nodemailer";

export interface SendEmailPayload {
  subject: string;
  text?: string;
  html?: string;
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT
    ? Number(process.env.SMTP_PORT)
    : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !port || !user || !pass || !from) {
    const missing: string[] = [];
    if (!host) missing.push("SMTP_HOST");
    if (!port) missing.push("SMTP_PORT");
    if (!user) missing.push("SMTP_USER");
    if (!pass) missing.push("SMTP_PASS");
    if (!from) missing.push("SMTP_FROM");

    console.error("❌ [Email] SMTP configuration missing env vars:", {
      missing,
    });
    throw new Error("SMTP configuration is incomplete");
  }

  return {
    host,
    port,
    user,
    pass,
    from,
  };
}

export async function sendEmail(payload: SendEmailPayload) {
  const { subject, text, html } = payload;

  if (!subject || typeof subject !== "string") {
    throw new Error("Email subject is required");
  }

  if (!text && !html) {
    throw new Error("Either text or html content is required");
  }

  const config = getSmtpConfig();

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: config.from,
      subject,
      text,
      html,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("✅ [Email] Message sent:", {
        messageId: info.messageId,
        response: info.response,
      });
    } else {
      console.log("✅ [Email] Message sent:", {
        messageId: info.messageId,
      });
    }

    return info;
  } catch (error) {
    console.error("❌ [Email] Failed to send email:", error);
    throw error;
  }
}



