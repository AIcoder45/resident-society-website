/* 
 * Google Analytics 4 integration - page view tracking
 * This component is client-side only and assumes the global gtag script
 * has been loaded in the root layout.
 */
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function sendPageView(url: string): void {
  if (!GA_MEASUREMENT_ID) {
    if (process.env.NODE_ENV === "development") {
      // Helpful warning in development so GA misconfiguration is caught early
      // eslint-disable-next-line no-console
      console.warn(
        "[Analytics] NEXT_PUBLIC_GA_MEASUREMENT_ID is not set; skipping page view for",
        url
      );
    }
    return;
  }

  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.warn(
        "[Analytics] window.gtag is not available yet; page view not sent for",
        url
      );
    }
    return;
  }

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[Analytics] Tracking page view:", {
      page_path: url,
      page_location: window.location.href,
    });
  }

  window.gtag("event", "page_view", {
    page_path: url,
    page_location: window.location.href,
  });
}

export function Analytics(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams?.toString();
    const url = search ? `${pathname}?${search}` : pathname;
    sendPageView(url);
  }, [pathname, searchParams]);

  return null;
}


