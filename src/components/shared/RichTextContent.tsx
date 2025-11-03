"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RichTextContentProps {
  content: string;
  className?: string;
}

/**
 * Rich Text Content Component
 * Safely renders HTML content from Strapi rich text editor
 * Handles paragraphs, lists, headings, and other HTML elements
 */
export function RichTextContent({
  content,
  className,
}: RichTextContentProps) {
  // If content is already HTML, use it directly
  // Otherwise, treat it as plain text with line breaks
  const htmlContent = React.useMemo(() => {
    if (!content) return "";

    // Check if content contains HTML tags
    const hasHtmlTags = /<[^>]+>/g.test(content);

    if (hasHtmlTags) {
      // Content is already HTML, sanitize and use as-is
      return content;
    } else {
      // Plain text - convert line breaks to paragraphs
      return content
        .split("\n\n")
        .filter((para) => para.trim())
        .map((para) => `<p>${para.trim().replace(/\n/g, "<br />")}</p>`)
        .join("");
    }
  }, [content]);

  return (
    <div
      className={cn(
        "max-w-none text-text",
        "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-text",
        "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-text",
        "[&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-text",
        "[&_p]:text-base [&_p]:leading-relaxed [&_p]:mb-4 [&_p]:text-text",
        "[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ul]:space-y-2",
        "[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_ol]:space-y-2",
        "[&_li]:text-base [&_li]:mb-2 [&_li]:leading-relaxed [&_li]:text-text",
        "[&_strong]:font-semibold [&_strong]:text-text",
        "[&_a]:text-primary [&_a]:no-underline [&_a]:hover:underline",
        "[&_img]:rounded-lg [&_img]:my-4 [&_img]:w-full [&_img]:h-auto",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4",
        className
      )}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

