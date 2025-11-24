import { MetadataRoute } from "next";
import { getTheme } from "@/lib/api";

/**
 * Web App Manifest
 * Makes the site installable as a PWA
 * Dynamically uses theme data from Strapi
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  // Fetch theme data to get dynamic colors and favicon
  // Wrap in try-catch to ensure manifest always returns valid data
  let theme;
  try {
    theme = await getTheme();
  } catch (error) {
    // Log error but continue with fallback values
    console.error("[Manifest] Failed to fetch theme data:", error);
    theme = null;
  }
  
  // Build icons array first
  const icons: MetadataRoute.Manifest["icons"] = [];

  // Determine icon source - prefer favicon, fallback to logo from theme, then logo.png
  // PWA requires both 192x192 and 512x512 icons for installation
  // Note: Browser will scale images, but having proper sizes helps with installation
  const iconSrc = theme?.favicon || theme?.logo || "/logo.png";

  // Add icons with proper sizes for PWA installation
  // Using the same source for both sizes - browser will scale appropriately
  icons.push(
    {
      src: iconSrc,
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: iconSrc,
      sizes: "192x192",
      type: "image/png",
      purpose: "maskable",
    },
    {
      src: iconSrc,
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: iconSrc,
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    }
  );

  const manifest: MetadataRoute.Manifest = {
    name: theme?.siteName || "Greenwood City Block C",
    short_name: theme?.siteShortName || "Block C",
    description: theme?.siteDescription || "Stay connected with Greenwood City Block C. Get the latest news, events, and updates.",
    start_url: "/",
    display: "standalone",
    background_color: theme?.backgroundColor || "#F0FFF4",
    theme_color: theme?.themeColor || "#2F855A",
    orientation: "portrait-primary",
    icons,
    categories: ["lifestyle", "social"],
  };

  return manifest;
}


