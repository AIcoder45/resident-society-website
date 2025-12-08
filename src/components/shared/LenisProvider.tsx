 "use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

interface LenisProviderProps {
  children: ReactNode;
}

/**
 * LenisProvider
 * Enables smooth scrolling across all pages using Lenis.
 * Wrap your app layout with this provider to apply globally.
 */
export function LenisProvider({ children }: LenisProviderProps) {
  useEffect(() => {
    const lenis = new Lenis({
      // Stronger effect so the smooth scroll is clearly visible
      lerp: 0.08,
      smoothWheel: true,
      // Note: 'smoothTouch' is not a valid Lenis option and has been removed.
    });

    // Simple debug to verify Lenis is running in the browser
    // You can check this in DevTools console
    // eslint-disable-next-line no-console
    console.log("[LenisProvider] Lenis initialized");

    let frameId: number;

    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };

    frameId = requestAnimationFrame(raf);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      lenis.destroy();
    };
  }, []);

  return children;
}


