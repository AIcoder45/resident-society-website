"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ImageCarouselProps {
  images: string[];
  title?: string;
  initialIndex?: number;
  onClose?: () => void;
  youtubeUrl?: string;
  instagramUrl?: string;
}

/**
 * Animation variants for backdrop
 */
const backdropVariants = {
  hidden: {
    opacity: 0,
    backdropFilter: "blur(0px)",
  },
  visible: {
    opacity: 1,
    backdropFilter: "blur(8px)",
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
  }
};

/**
 * Animation variants for image slides
 */
const slideVariants = {
  enter: (dir: "left" | "right") => ({
    opacity: 0,
    x: dir === "right" ? 300 : -300,
    scale: 0.95
  }),
  exit: (dir: "left" | "right") => ({
    opacity: 0,
    x: dir === "right" ? -300 : 300,
    scale: 0.95
  })
};

/**
 * Hook to detect viewport dimensions with comprehensive device support
 * Returns viewport width, height, device type, and orientation
 * 
 * Enhanced Logic:
 * - Detects mobile, tablet, and desktop devices
 * - Handles portrait and landscape orientations
 * - Accounts for safe areas and browser UI
 * - Supports all device sizes from small phones to large desktops
 */
function useViewportDimensions() {
  const [dimensions, setDimensions] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    isPortrait: true,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
  });

  React.useEffect(() => {
    const updateDimensions = () => {
      // Use requestAnimationFrame to ensure accurate measurements
      requestAnimationFrame(() => {
        // Use visual viewport if available (better for mobile browsers)
        const visualViewport = window.visualViewport;
        const width = visualViewport?.width || window.innerWidth;
        const height = visualViewport?.height || window.innerHeight;
        
        // Enhanced device detection
        // Mobile: < 768px (phones)
        // Tablet: 768px - 1024px (tablets, large phones in landscape)
        // Desktop: > 1024px
        const isMobile = width < 768;
        const isTablet = width >= 768 && width < 1024;
        const isPortrait = height > width;
        const devicePixelRatio = window.devicePixelRatio || 1;

        setDimensions({
          width,
          height,
          isMobile,
          isTablet,
          isPortrait,
          devicePixelRatio,
        });
      });
    };

    // Initial measurement with slight delay to ensure accurate viewport
    const initialTimeout = setTimeout(updateDimensions, 100);

    // Listen for resize events (handles mobile browser UI show/hide)
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);
    
    // Visual viewport API for better mobile support (if available)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateDimensions);
      window.visualViewport.addEventListener('scroll', updateDimensions);
    }

    return () => {
      clearTimeout(initialTimeout);
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateDimensions);
        window.visualViewport.removeEventListener('scroll', updateDimensions);
      }
    };
  }, []);

  return dimensions;
}

/**
 * Image Preview Component
 * 
 * Enhanced Image Display Logic for All Image Sizes:
 * 1. Container has FIXED dimensions (calculated from viewport)
 * 2. Image uses object-fit: contain (scales to fit, no cropping)
 * 3. Image is centered both horizontally and vertically
 * 4. Aspect ratio is ALWAYS preserved (handles all ratios: 1:1, 16:9, 9:16, 21:9, etc.)
 * 5. Container NEVER resizes - only image scales inside it
 * 6. Handles extreme aspect ratios (very wide panoramas, very tall portraits)
 * 7. This prevents layout jumps when switching images
 */
interface ImagePreviewProps {
  src: string;
  alt: string;
  isLoading: boolean;
  isZoomed: boolean;
  swipeOffset: number;
  onLoad: () => void;
  onError?: () => void;
  imageCount?: number;
  currentIndex?: number;
}

function ImagePreview({ 
  src, 
  alt, 
  isLoading, 
  isZoomed, 
  swipeOffset, 
  onLoad,
  onError,
  imageCount,
  currentIndex 
}: ImagePreviewProps) {
  const [hasError, setHasError] = React.useState(false);
  const [imageAspectRatio, setImageAspectRatio] = React.useState<number | null>(null);
  const [imageDimensions, setImageDimensions] = React.useState<{ width: number; height: number } | null>(null);

  // Reset error state when src changes
  React.useEffect(() => {
    setHasError(false);
    setImageAspectRatio(null);
    setImageDimensions(null);
  }, [src]);

  const handleError = React.useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  const handleLoad = React.useCallback((e?: React.SyntheticEvent<HTMLImageElement>) => {
    // Detect aspect ratio and dimensions to ensure no distortion
    if (e?.currentTarget) {
      const img = e.currentTarget;
      if (img.naturalWidth && img.naturalHeight) {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        setImageAspectRatio(aspectRatio);
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
        
        // Log extreme aspect ratios in development for debugging
        if (process.env.NODE_ENV === 'development') {
          if (aspectRatio > 3 || aspectRatio < 0.33) {
            console.log('📐 Extreme aspect ratio detected:', {
              ratio: aspectRatio.toFixed(2),
              dimensions: `${img.naturalWidth}x${img.naturalHeight}`,
              type: aspectRatio > 3 ? 'Very wide (panorama)' : 'Very tall (portrait)',
            });
          }
        }
      }
    }
    setHasError(false);
    onLoad();
  }, [onLoad]);

  return (
    <div 
      className="absolute inset-0 w-full h-full"
      style={{
        // Fixed container - never changes size (Instagram/Facebook approach)
        // Container provides the bounds for the image
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0,
        minHeight: 0,
        width: '100%',
        height: '100%',
      }}
    >
      {/* Image wrapper - CRITICAL: Must be relative for Next.js Image fill */}
      <div
        className="relative w-full h-full"
        style={{
          // Container for image - maintains aspect ratio
          // Instagram/Facebook: Full container size, image scales inside
          // Use 100% width/height to fill parent completely
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 0,
          minHeight: 0,
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        {!hasError ? (
          <Image
            src={src}
            alt={alt}
            fill
            className={cn(
              "select-none transition-opacity duration-300",
              isLoading && "opacity-0"
            )}
            style={{
              // Enhanced Logic: object-fit: contain for all image types
              // CRITICAL: This ensures proper handling of all aspect ratios
              // object-fit: contain ensures:
              // - Image scales to fit container (no overflow)
              // - Aspect ratio ALWAYS preserved (no distortion)
              // - No cropping, no stretching
              // - Image centered automatically
              // - Works for all image sizes: square, wide, tall, panoramas
              objectFit: 'contain',
              objectPosition: 'center center',
              // Ensure smooth rendering for all image sizes
              imageRendering: 'auto',
            }}
            sizes="(max-width: 360px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 90vw, (max-width: 1920px) 85vw, 80vw"
            priority={false}
            onLoad={handleLoad}
            onError={handleError}
            draggable={false}
            unoptimized={src.startsWith("/") && !src.startsWith("http")}
            suppressHydrationWarning
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-white/60 p-4">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm text-center">Failed to load image</p>
          </div>
        )}
        
        {/* Image Count Overlay - Top Right Corner (Instagram/Facebook style) */}
        {imageCount && imageCount > 1 && typeof currentIndex === 'number' && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 pointer-events-none">
            <div className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md text-xs sm:text-sm font-semibold shadow-lg">
              {currentIndex + 1} / {imageCount}
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Swipe gesture handler
 * Independent of image sizing - only handles navigation
 * 
 * Instagram/Facebook Swipe Logic:
 * - Horizontal swipe threshold: ~80px
 * - Smooth transitions between images
 * - Swipe offset applied during gesture
 * - Container never moves, only images slide
 */
function useSwipeNavigation(
  onNext: () => void,
  onPrevious: () => void,
  enabled: boolean
) {
  const [swipeOffset, setSwipeOffset] = React.useState(0);
  const [isSwiping, setIsSwiping] = React.useState(false);
  const touchStartX = React.useRef<number | null>(null);
  const touchStartY = React.useRef<number | null>(null);
  const swipeOffsetRef = React.useRef(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleTouchStart = React.useCallback((e: TouchEvent) => {
    if (!enabled) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(false);
  }, [enabled]);

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (!enabled || touchStartX.current === null || touchStartY.current === null) return;

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - touchStartX.current;
    const deltaY = touchY - touchStartY.current;

    // Determine if this is a horizontal swipe
    if (!isSwiping) {
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10;
      if (isHorizontalSwipe) {
        setIsSwiping(true);
      }
    }

    if (isSwiping) {
      e.preventDefault();
      swipeOffsetRef.current = deltaX;
      setSwipeOffset(deltaX);
    }
  }, [enabled, isSwiping]);

  const handleTouchEnd = React.useCallback(() => {
    if (!enabled || !isSwiping || touchStartX.current === null) {
      touchStartX.current = null;
      touchStartY.current = null;
      swipeOffsetRef.current = 0;
      setSwipeOffset(0);
      setIsSwiping(false);
      return;
    }

    // Instagram/Facebook use ~80px threshold for swipe navigation
    const threshold = 80;
    const swipeDistance = swipeOffsetRef.current;

    if (Math.abs(swipeDistance) > threshold) {
      if (swipeDistance > 0) {
        onPrevious();
      } else {
        onNext();
      }
      setTimeout(() => {
        swipeOffsetRef.current = 0;
        setSwipeOffset(0);
      }, 100);
    } else {
      swipeOffsetRef.current = 0;
      setSwipeOffset(0);
    }

    touchStartX.current = null;
    touchStartY.current = null;
    setIsSwiping(false);
  }, [enabled, onNext, onPrevious, isSwiping]);

  // Set up touch event listeners
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, enabled]);

  // Reset swipe offset when navigation occurs
  React.useEffect(() => {
    swipeOffsetRef.current = 0;
    setSwipeOffset(0);
  }, [enabled]);

  return { containerRef, swipeOffset, isSwiping };
}

/**
 * Image Carousel Component
 * 
 * Implementation following Instagram/Facebook image preview logic:
 * 
 * 1. VIEWPORT DETECTION FIRST
 *    - Detect mobile viewport dimensions
 *    - Calculate container size based on viewport
 * 
 * 2. FIXED CONTAINER SIZE
 *    - Container dimensions are calculated once
 *    - Container NEVER resizes (prevents layout shifts)
 *    - Only images scale inside the container
 * 
 * 3. IMAGE FITTING
 *    - object-fit: contain (always)
 *    - Images centered horizontally and vertically
 *    - Aspect ratio preserved
 *    - No cropping, no stretching
 * 
 * 4. SMOOTH NAVIGATION
 *    - Swipe gestures independent of image sizing
 *    - Smooth transitions between images
 *    - No resize jumps when switching images
 */
export function ImageCarousel({
  images,
  title,
  initialIndex = 0,
  onClose,
  youtubeUrl,
  instagramUrl,
}: ImageCarouselProps) {
  // Viewport detection for swipe navigation (mobile/tablet detection)
  const viewport = useViewportDimensions();

  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [isLoading, setIsLoading] = React.useState(true);
  const [imageError, setImageError] = React.useState<string | null>(null);
  const [direction, setDirection] = React.useState<"left" | "right">("right");
  const [isHovered, setIsHovered] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [isZoomed, setIsZoomed] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Navigation handlers
  const goToNext = React.useCallback(() => {
    if (images.length <= 1) return;
    setDirection("right");
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsLoading(true);
    setIsZoomed(false);
    setImageError(null);
  }, [images.length]);

  const goToPrevious = React.useCallback(() => {
    if (images.length <= 1) return;
    setDirection("left");
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsLoading(true);
    setIsZoomed(false);
    setImageError(null);
  }, [images.length]);

  // Swipe navigation hook - independent of image sizing
  const { containerRef, swipeOffset, isSwiping } = useSwipeNavigation(
    goToNext,
    goToPrevious,
    images.length > 1
  );

  const handleClose = React.useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose?.();
    }, 300);
  }, [onClose]);

  // Reset zoom when image changes
  React.useEffect(() => {
    setIsZoomed(false);
    setImageError(null);
    setIsLoading(true);
  }, [currentIndex]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isClosing) return;
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "+" || e.key === "=") {
        setIsZoomed(true);
      } else if (e.key === "-") {
        setIsZoomed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious, handleClose, isClosing]);

  const currentImage = images[currentIndex];
  if (!currentImage) return null;

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          ref={modalRef}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center overflow-hidden"
          style={{
            // Mobile: Use dynamic viewport height (100dvh) for better mobile browser support
            // 100dvh accounts for mobile browser UI (address bar, etc.)
            width: '100vw',
            height: '100dvh', // Dynamic viewport height - better for mobile
            // Fallback to 100vh for browsers that don't support dvh
            minHeight: '100vh',
            // Handle mobile safe areas
            paddingTop: 'env(safe-area-inset-top, 0)',
            paddingBottom: 'env(safe-area-inset-bottom, 0)',
            paddingLeft: 'env(safe-area-inset-left, 0)',
            paddingRight: 'env(safe-area-inset-right, 0)',
          }}
          onClick={(e) => {
            // Close on backdrop click
            if (e.target === e.currentTarget && !isZoomed) {
              handleClose();
            }
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Main Container - Contains all elements: close button, images, thumbnails */}
          {/* Using relative positioning with absolute children for precise layout control */}
          <div 
            className="relative w-full h-full"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {/* Header Section - Close button and title - ABSOLUTE at top */}
            <div 
              className="absolute top-0 left-0 right-0 z-30 h-11 sm:h-12 md:h-14 lg:h-16"
            >
              {/* Close button */}
              <motion.button
                onClick={handleClose}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2.5 sm:p-3 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation shadow-lg"
                aria-label="Close"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.button>
              
              {/* Title */}
              {title && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="absolute top-2 sm:top-3 md:top-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 rounded-full text-xs sm:text-sm font-medium shadow-xl border border-white/10 max-w-[85%] sm:max-w-[80%] text-center"
                >
                  {title}
                </motion.div>
              )}
            </div>

            {/* Image Preview Section - ABSOLUTE positioned between header and thumbnails */}
            {/* Top: 44px (header), Bottom: 56px (thumbnails) on mobile, or 0 if single image */}
            <div 
              className={cn(
                "absolute left-0 right-0 top-11 sm:top-12 md:top-14 lg:top-16 flex items-center justify-center overflow-hidden",
                images.length > 1 
                  ? "bottom-14 sm:bottom-16 md:bottom-[72px]" 
                  : "bottom-0"
              )}
            >
              {/* Previous button */}
              {images.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ 
                    opacity: isHovered || isSwiping ? 1 : 0.8,
                    x: isHovered || isSwiping ? 0 : -10
                  }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1 sm:left-2 md:left-4 z-20"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToPrevious}
                    className="bg-white/10 hover:bg-white/25 active:bg-white/30 text-white h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-full backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl touch-manipulation border border-white/10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
                  </Button>
                </motion.div>
              )}

              {/* Image Preview Container - Using Tailwind responsive classes */}
              {/* Full width/height container - image scales inside with object-contain */}
              <div 
                ref={containerRef}
                className={cn(
                  "relative flex items-center justify-center w-full h-full p-0 min-w-0 min-h-0 max-w-full max-h-full",
                  isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                )}
                onClick={(e) => {
                  if (isZoomed) {
                    setIsZoomed(false);
                  }
                  e.stopPropagation();
                }}
                onDoubleClick={() => {
                  setIsZoomed(!isZoomed);
                }}
              >
                {/* Image Slide Container - Handles transitions */}
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate={{ 
                      opacity: 1, 
                      x: swipeOffset,
                      scale: isZoomed ? 2 : 1,
                    }}
                    exit="exit"
                    transition={{ 
                      duration: isSwiping ? 0 : 0.5,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      cursor: isSwiping ? 'grabbing' : (isZoomed ? 'zoom-out' : 'zoom-in'),
                      touchAction: isZoomed ? 'pan-x pan-y' : 'pan-x',
                    }}
                    onAnimationComplete={() => {
                      if (!isSwiping) {
                        setIsLoading(false);
                      }
                    }}
                  >
                    {/* Image Preview - Handles fitting and aspect ratio */}
                    {/* Instagram/Facebook: object-fit: contain, centered, no resize jumps */}
                    <ImagePreview
                      src={currentImage}
                      alt={title ? `${title} - Image ${currentIndex + 1}` : `Gallery image ${currentIndex + 1}`}
                      isLoading={isLoading}
                      isZoomed={isZoomed}
                      swipeOffset={swipeOffset}
                      imageCount={images.length}
                      currentIndex={currentIndex}
                      onLoad={() => {
                        setIsLoading(false);
                        setImageError(null);
                      }}
                      onError={() => {
                        setIsLoading(false);
                        setImageError(currentImage);
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Next button */}
              {images.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ 
                    opacity: isHovered || isSwiping ? 1 : 0.8,
                    x: isHovered || isSwiping ? 0 : 10
                  }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-1 sm:right-2 md:right-4 z-20"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToNext}
                    className="bg-white/10 hover:bg-white/25 active:bg-white/30 text-white h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-full backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl touch-manipulation border border-white/10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
                  </Button>
                </motion.div>
              )}

              {/* Image counter */}
              {images.length > 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 0.7, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium z-20 shadow-lg"
                >
                  {currentIndex + 1} / {images.length}
                </motion.div>
              )}

              {/* Video Platform Buttons */}
              {(youtubeUrl || instagramUrl) && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  className={`absolute ${images.length > 1 ? 'bottom-16 sm:bottom-20' : 'bottom-2 sm:bottom-4'} left-1/2 transform -translate-x-1/2 flex flex-col sm:flex-row gap-2 z-20`}
                >
                  {youtubeUrl && (
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg text-xs sm:text-sm font-medium whitespace-nowrap backdrop-blur-sm"
                      aria-label="Watch on YouTube"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <span className="hidden sm:inline">Watch on YouTube</span>
                      <span className="sm:hidden">YouTube</span>
                    </a>
                  )}
                  {instagramUrl && (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 active:from-purple-700 active:via-pink-700 active:to-orange-700 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg text-xs sm:text-sm font-medium whitespace-nowrap backdrop-blur-sm"
                      aria-label="View on Instagram"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span className="hidden sm:inline">View on Instagram</span>
                      <span className="sm:hidden">Instagram</span>
                    </a>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer Section - Thumbnails ABSOLUTE at bottom */}
            {/* Tailwind responsive height: h-14 (56px) on mobile, h-16 (64px) on sm, h-[72px] on md+ */}
            {images.length > 1 && (
              <div 
                className="absolute bottom-0 left-0 right-0 z-10 h-14 sm:h-16 md:h-[72px] px-1 py-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="h-full flex items-center"
                >
                  {/* Thumbnail scroll container - Tailwind classes */}
                  <div 
                    className="flex gap-1 sm:gap-1.5 md:gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide px-1 sm:px-1.5 md:px-2 py-1 sm:py-1.5 bg-black/40 backdrop-blur-md rounded-md w-full justify-center touch-pan-x"
                  >
                    {images.map((image, index) => (
                      <motion.button
                        key={index}
                        onClick={() => {
                          setDirection(index > currentIndex ? "right" : "left");
                          setCurrentIndex(index);
                          setIsLoading(true);
                          setIsZoomed(false);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-md overflow-hidden border-2 transition-all duration-200 flex-shrink-0",
                          currentIndex === index
                            ? "border-primary ring-1 ring-primary/50 shadow-md"
                            : "border-transparent opacity-60 hover:opacity-100 hover:border-white/40"
                        )}
                      >
                        <Image
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 40px, (max-width: 768px) 44px, 48px"
                        />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
