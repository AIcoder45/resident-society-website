import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { ServiceWorkerRegistration } from "@/components/shared/ServiceWorkerRegistration";
import { MaintenancePage } from "@/components/shared/MaintenancePage";
import { getTheme } from "@/lib/api";
import { StrapiApiError } from "@/lib/strapi";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Force dynamic rendering - always fetch fresh content
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Greenwood City Block C - Building Community Together",
  description: "Stay connected with Greenwood City Block C. Get the latest news, events, and updates.",
  keywords: ["greenwood city", "greenwood city block c", "block c", "community", "news", "events", "notifications"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Block C",
  },
  // Additional iOS meta tags for better PWA installation
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Block C",
    "mobile-web-app-capable": "yes",
  },
  // Next.js automatically links manifest.ts route as /manifest.json
  // Explicitly setting it ensures proper PWA installation
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch theme data from Strapi with error handling
  let theme = null;
  let showMaintenance = false;

  try {
    theme = await getTheme();
  } catch (error) {
    // Check if it's a StrapiApiError (API connection failure after retries)
    if (error instanceof StrapiApiError) {
      console.error("❌ [Layout] Strapi API unavailable after retries:", error);
      showMaintenance = true;
    } else {
      // For other errors, log but don't show maintenance page
      console.error("❌ [Layout] Error fetching theme:", error);
    }
  }

  // Update theme color for metadata
  const themeColor = theme?.themeColor || "#2F855A";

  // If API is unavailable, show maintenance page
  if (showMaintenance) {
    return (
      <html lang="en">
        <body className={`${inter.variable} font-sans antialiased`}>
          <ServiceWorkerRegistration />
          <MaintenancePage />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ServiceWorkerRegistration />
        <ClientLayout theme={theme}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
