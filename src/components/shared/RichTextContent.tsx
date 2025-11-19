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
        // Headings - Responsive font sizes for mobile
        "[&_h1]:text-2xl [&_h1]:sm:text-3xl [&_h1]:md:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-text [&_h1]:leading-tight",
        "[&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:md:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-text [&_h2]:leading-tight",
        "[&_h3]:text-lg [&_h3]:sm:text-xl [&_h3]:md:text-xl [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-text [&_h3]:leading-tight",
        "[&_h4]:text-base [&_h4]:sm:text-lg [&_h4]:md:text-lg [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:mt-3 [&_h4]:text-text",
        // Paragraphs - Ensure readable font size on mobile (16px minimum)
        "[&_p]:text-base [&_p]:sm:text-base [&_p]:leading-relaxed [&_p]:sm:leading-relaxed [&_p]:mb-4 [&_p]:text-text [&_p]:max-w-full",
        // Lists - Mobile-friendly spacing
        "[&_ul]:list-disc [&_ul]:ml-4 [&_ul]:sm:ml-6 [&_ul]:mb-4 [&_ul]:space-y-2",
        "[&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:sm:ml-6 [&_ol]:mb-4 [&_ol]:space-y-2",
        "[&_li]:text-base [&_li]:sm:text-base [&_li]:mb-2 [&_li]:leading-relaxed [&_li]:text-text",
        // Other elements
        "[&_strong]:font-semibold [&_strong]:text-text",
        "[&_em]:italic",
        "[&_a]:text-primary [&_a]:no-underline [&_a]:hover:underline [&_a]:break-words",
        "[&_img]:rounded-lg [&_img]:my-4 [&_img]:w-full [&_img]:h-auto [&_img]:max-w-full",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:pr-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-text-light",
        "[&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono",
        "[&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4",
        "[&_table]:w-full [&_table]:border-collapse [&_table]:my-4",
        "[&_th]:border [&_th]:border-gray-300 [&_th]:px-2 [&_th]:py-2 [&_th]:bg-gray-50 [&_th]:text-left [&_th]:font-semibold",
        "[&_td]:border [&_td]:border-gray-300 [&_td]:px-2 [&_td]:py-2",
        className
      )}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

