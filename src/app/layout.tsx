import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { ServiceWorkerRegistration } from "@/components/shared/ServiceWorkerRegistration";
import { PWAInstallPrompt } from "@/components/shared/PWAInstallPrompt";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { OfflineHandler } from "@/components/shared/OfflineHandler";
import { ContrastValidator } from "@/components/shared/ContrastValidator";
import { getTheme } from "@/lib/api";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Greenwood City Block C - Building Community Together",
  description: "Stay connected with Greenwood City Block C. Get the latest news, events, and updates.",
  keywords: ["greenwood city", "greenwood city block c", "block c", "community", "news", "events", "notifications"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Block C",
  },
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch theme data from Strapi
  const theme = await getTheme();

  // Update theme color for metadata
  const themeColor = theme?.themeColor || "#2F855A";

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ServiceWorkerRegistration />
        <ErrorBoundary>
          <ThemeProvider theme={theme}>
        <div className="flex min-h-screen flex-col">
          <Header />
              <main className="flex-1 pb-16 lg:pb-0">{children}</main>
          <Footer />
              <MobileBottomNav />
              <PWAInstallPrompt />
              <OfflineHandler />
              <ContrastValidator />
        </div>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
