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
  
  const manifest: MetadataRoute.Manifest = {
    name: theme?.siteName || "Greenwood City Block C",
    short_name: theme?.siteShortName || "Block C",
    description: theme?.siteDescription || "Stay connected with Greenwood City Block C. Get the latest news, events, and updates.",
    start_url: "/",
    display: "standalone",
    background_color: theme?.backgroundColor || "#F0FFF4",
    theme_color: theme?.themeColor || "#2F855A",
    orientation: "portrait-primary",
    icons: [],
    categories: ["lifestyle", "social"],
  };

  // Add favicon as icon if available
  if (theme?.favicon) {
    manifest.icons.push({
      src: theme.favicon,
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    });
    manifest.icons.push({
      src: theme.favicon,
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable",
    });
  } else if (theme?.logo) {
    // Fallback to logo if favicon not available
    manifest.icons.push({
      src: theme.logo,
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    });
    manifest.icons.push({
      src: theme.logo,
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable",
    });
  }

  return manifest;
}


