"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface PullToRefreshProps {
  children: React.ReactNode;
  threshold?: number; // Distance in pixels to trigger refresh
  disabled?: boolean;
}

/**
 * Pull-to-refresh component for web view
 * Works on touch devices by detecting pull-down gestures
 */
export function PullToRefresh({
  children,
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const router = useRouter();
  const [isPulling, setIsPulling] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const touchStartY = React.useRef<number | null>(null);
  const shouldRefresh = React.useRef(false);

  // Check if we're at the top of the page
  const isAtTop = () => {
    if (typeof window === "undefined") return false;
    return window.scrollY === 0 || document.documentElement.scrollTop === 0;
  };

  const handleTouchStart = React.useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing || !isAtTop()) return;

    touchStartY.current = e.touches[0].clientY;
  }, [disabled, isRefreshing]);

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing || touchStartY.current === null || !isAtTop()) {
      return;
    }

    const touchY = e.touches[0].clientY;
    const distance = touchY - (touchStartY.current || 0);

    // Only allow pull-down (positive distance)
    if (distance > 0 && isAtTop()) {
      e.preventDefault(); // Prevent default scroll behavior
      setIsPulling(true);
      setPullDistance(Math.min(distance, threshold * 1.5)); // Cap at 1.5x threshold
    }
  }, [disabled, isRefreshing, threshold]);

  const handleTouchEnd = React.useCallback(() => {
    if (disabled || isRefreshing || touchStartY.current === null) return;

    setPullDistance((currentDistance) => {
      if (currentDistance >= threshold && isAtTop()) {
        setIsRefreshing(true);
        shouldRefresh.current = true;
        return threshold;
      } else {
        // Reset if not enough pull distance
        setIsPulling(false);
        touchStartY.current = null;
        return 0;
      }
    });
  }, [disabled, isRefreshing, threshold]);

  // Handle refresh in useEffect to avoid updating Router during render
  React.useEffect(() => {
    if (shouldRefresh.current && isRefreshing) {
      shouldRefresh.current = false;
      
      // Use setTimeout to defer router.refresh() outside of render phase
      setTimeout(async () => {
        try {
          // Invalidate all Strapi cache tags
          // This ensures fresh data is fetched on refresh
          if (typeof window !== "undefined") {
            // Call server action to invalidate cache
            const response = await fetch("/api/revalidate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                tags: ["strapi-all"],
                path: window.location.pathname,
              }),
            });
            
            if (!response.ok) {
              console.warn("⚠️ Cache invalidation failed, using router.refresh()");
            }
          }
          
          // Always refresh the router to update the page
          router.refresh();
          
          // Reset after a short delay
          setTimeout(() => {
            setIsRefreshing(false);
            setIsPulling(false);
            setPullDistance(0);
            touchStartY.current = null;
          }, 1000);
        } catch (error) {
          console.error("❌ Error during refresh:", error);
          // Fallback to router.refresh() if cache invalidation fails
          router.refresh();
          setTimeout(() => {
            setIsRefreshing(false);
            setIsPulling(false);
            setPullDistance(0);
            touchStartY.current = null;
          }, 1000);
        }
      }, 0);
    }
  }, [isRefreshing, router]);

  React.useEffect(() => {
    if (disabled) return;

    // Attach listeners to document for better touch detection
    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [disabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Calculate pull progress (0 to 1)
  const pullProgress = Math.min(pullDistance / threshold, 1);
  const showIndicator = isPulling || isRefreshing;

  return (
    <div className="relative">
      {/* Pull-to-refresh indicator */}
      {showIndicator && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-200"
          style={{
            height: `${Math.min(pullDistance, threshold)}px`,
            opacity: pullProgress,
            transform: `translateY(${showIndicator ? 0 : -100}%)`,
          }}
        >
          <div className="flex flex-col items-center gap-2">
            {isRefreshing ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Refreshing...</span>
              </>
            ) : (
              <>
                <Loader2
                  className="h-6 w-6 text-primary transition-transform"
                  style={{
                    transform: `rotate(${pullProgress * 180}deg)`,
                  }}
                />
                <span className="text-sm text-muted-foreground">
                  {pullProgress >= 1 ? "Release to refresh" : "Pull to refresh"}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content wrapper with pull effect */}
      <div
        style={{
          transform: showIndicator ? `translateY(${Math.min(pullDistance, threshold)}px)` : "translateY(0)",
          transition: isRefreshing ? "transform 0.3s ease-out" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}

