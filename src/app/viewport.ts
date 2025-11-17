import type { Viewport } from "next";

/**
 * Viewport configuration
 * Must be exported separately from metadata in Next.js 14+
 * Note: viewport export cannot be async, so theme color is handled dynamically via ThemeProvider
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  // Theme color is updated dynamically by ThemeProvider component
  themeColor: "#2F855A", // Default, will be updated by ThemeProvider via meta tag
};
