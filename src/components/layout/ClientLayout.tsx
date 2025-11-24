"use client";

import * as React from "react";
import { Toaster } from "sonner";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { PWAInstallPrompt } from "@/components/shared/PWAInstallPrompt";
import { OfflineHandler } from "@/components/shared/OfflineHandler";
import { ShareButton } from "@/components/shared/ShareButton";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { PullToRefresh } from "@/components/shared/PullToRefresh";
import type { Theme } from "@/types";

interface ClientLayoutProps {
  theme: Theme | null;
  children: React.ReactNode;
}

/**
 * Client Layout Component
 * Wraps all client-side components to ensure proper context availability
 * Separates client components from server component layout
 */
export function ClientLayout({ theme, children }: ClientLayoutProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <PullToRefresh>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pb-14 sm:pb-16 lg:pb-0">{children}</main>
            <Footer />
            <PWAInstallPrompt />
            <OfflineHandler />
          </div>
        </PullToRefresh>
        <MobileBottomNav />
        <ShareButton variant="floating" />
        <Toaster 
          position="top-center" 
          duration={5000}
          richColors
          closeButton
        />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

