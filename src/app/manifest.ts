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
  let iconSrc = theme?.favicon || theme?.logo || "/logo.png";
  
  // Fix icon URL - ensure it's not localhost or invalid URL
  // If it contains localhost or is from Strapi with localhost, use fallback
  if (iconSrc) {
    // Check if URL contains localhost (development URL)
    if (iconSrc.includes("localhost") || iconSrc.includes("127.0.0.1")) {
      // Use fallback logo instead of localhost URL
      iconSrc = "/logo.png";
    } else if (!iconSrc.startsWith("http") && !iconSrc.startsWith("/")) {
      // Ensure relative paths start with /
      iconSrc = `/${iconSrc}`;
    } else if (iconSrc.startsWith("http")) {
      // For external URLs, validate they're not localhost
      try {
        const url = new URL(iconSrc);
        if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
          iconSrc = "/logo.png";
        }
      } catch {
        // Invalid URL, use fallback
        iconSrc = "/logo.png";
      }
    }
  } else {
    iconSrc = "/logo.png";
  }
  
  // Add icons with proper sizes for PWA installation
  // iconSrc is guaranteed to be set (fallback to /logo.png)
  icons.push(
    {
      src: iconSrc,
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: iconSrc,
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
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


