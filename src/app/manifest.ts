import { MetadataRoute } from "next";

/**
 * Web App Manifest
 * Makes the site installable as a PWA
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Greenwood City Block C",
    short_name: "Block C",
    description: "Stay connected with Greenwood City Block C. Get the latest news, events, and updates.",
    start_url: "/",
    display: "standalone",
    background_color: "#F0FFF4",
    theme_color: "#2F855A",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    categories: ["lifestyle", "social"],
    screenshots: [
      {
        src: "/screenshot-wide.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Greenwood City Block C Homepage",
      },
      {
        src: "/screenshot-narrow.png",
        sizes: "720x1280",
        type: "image/png",
        form_factor: "narrow",
        label: "Greenwood City Block C Mobile View",
      },
    ],
  };
}


