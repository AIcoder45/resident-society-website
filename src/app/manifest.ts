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

  // Add icons - prefer favicon, fallback to logo from theme, then logo.png
  // PWA requires both 192x192 and 512x512 icons for installation
  if (theme?.favicon) {
    icons.push(
      {
        src: theme.favicon,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: theme.favicon,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: theme.favicon,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: theme.favicon,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      }
    );
  } else if (theme?.logo) {
    // Fallback to logo from theme if favicon not available
    icons.push(
      {
        src: theme.logo,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: theme.logo,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: theme.logo,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: theme.logo,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      }
    );
  } else {
    // Final fallback to public/logo.png - ensure this always exists
    icons.push(
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      }
    );
  }

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


