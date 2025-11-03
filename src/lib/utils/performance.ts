/**
 * Performance optimization utilities
 * Mobile-first optimizations for better user experience
 */

/**
 * Debounce function to limit function calls
 * Useful for scroll, resize, and input events
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function calls
 * Useful for scroll and resize events where you want
 * regular updates at specific intervals
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Check if element is in viewport
 * Useful for lazy loading and animations
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Add passive event listener
 * Improves scroll performance on mobile
 */
export function addPassiveEventListener(
  element: EventTarget,
  event: string,
  handler: EventListener,
  options: AddEventListenerOptions = {}
): void {
  element.addEventListener(event, handler, {
    ...options,
    passive: true,
  });
}

/**
 * Preload critical resources
 * Improves initial page load
 */
export function preloadResource(
  href: string,
  as: "script" | "style" | "image" | "font" | "fetch"
): void {
  if (typeof window !== "undefined") {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = as;
    if (as === "font") {
      link.crossOrigin = "anonymous";
    }
    document.head.appendChild(link);
  }
}


