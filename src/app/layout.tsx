import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/shared/ServiceWorkerRegistration";
import { ThemeLayoutServer } from "@/components/layout/ThemeLayoutServer";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap", // Optimize font loading - show fallback until font loads
  preload: true, // Preload font for better performance
});

// Force dynamic rendering - always fetch fresh content
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Greenwood City Block C - Building Community Together",
  description: "Stay connected with Greenwood City Block C. Get the latest news, events, and updates.",
  keywords: ["greenwood city", "greenwood city block c", "block c", "community", "news", "events", "notifications"],
  // iOS meta tags for PWA installation (using modern standard)
  // Note: Removed appleWebApp.capable as it generates deprecated apple-mobile-web-app-capable
  other: {
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
    shortcut: [
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ServiceWorkerRegistration />
        <ThemeLayoutServer>{children}</ThemeLayoutServer>
      </body>
    </html>
  );
}
