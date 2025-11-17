import { MetadataRoute } from "next";
import { getTheme } from "@/lib/api";

/**
 * Web App Manifest
 * Makes the site installable as a PWA
 * Dynamically uses theme data from Strapi
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  // Fetch theme data to get dynamic colors and favicon
  const theme = await getTheme();
  
  // Build icons array first
  const icons: MetadataRoute.Manifest["icons"] = [];

  // Add icons - prefer favicon, fallback to logo
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
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      }
    );
  } else if (theme?.logo) {
    // Fallback to logo if favicon not available
    icons.push(
      {
        src: theme.logo,
        sizes: "192x192",
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
  }

  // Ensure at least one icon exists for PWA installation
  if (icons.length === 0) {
    // Add placeholder icons (these should be created)
    icons.push(
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
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


