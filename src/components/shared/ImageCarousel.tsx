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
 * Image carousel lightbox component with navigation
 * Displays images in a modal with previous/next navigation
 */
export function ImageCarousel({
  images,
  title,
  initialIndex = 0,
  onClose,
  youtubeUrl,
  instagramUrl,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [isLoading, setIsLoading] = React.useState(true);
  const [swipeOffset, setSwipeOffset] = React.useState(0);
  const [direction, setDirection] = React.useState<"left" | "right">("right");
  const [isHovered, setIsHovered] = React.useState(false);
  const touchStartX = React.useRef<number | null>(null);
  const touchStartY = React.useRef<number | null>(null);
  const isSwiping = React.useRef(false);
  const swipeOffsetRef = React.useRef(0);

  const goToNext = React.useCallback(() => {
    setDirection("right");
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsLoading(true);
  }, [images.length]);

  const goToPrevious = React.useCallback(() => {
    setDirection("left");
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsLoading(true);
  }, [images.length]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious, onClose]);

  // Handle touch/swipe gestures
  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  }, []);

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - touchStartX.current;
    const deltaY = touchY - touchStartY.current;

    // Determine if this is a horizontal swipe (more horizontal than vertical)
    if (!isSwiping.current) {
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10;
      if (isHorizontalSwipe) {
        isSwiping.current = true;
      }
    }

    if (isSwiping.current && images.length > 1) {
      e.preventDefault();
      swipeOffsetRef.current = deltaX;
      setSwipeOffset(deltaX);
    }
  }, [images.length]);

  const handleTouchEnd = React.useCallback(() => {
    if (!isSwiping.current || touchStartX.current === null) {
      touchStartX.current = null;
      touchStartY.current = null;
      swipeOffsetRef.current = 0;
      setSwipeOffset(0);
      return;
    }

    const threshold = 50; // Minimum swipe distance to trigger navigation
    const swipeDistance = swipeOffsetRef.current;

    if (Math.abs(swipeDistance) > threshold) {
      if (swipeDistance > 0) {
        // Swipe right - go to previous
        setDirection("left");
        goToPrevious();
      } else {
        // Swipe left - go to next
        setDirection("right");
        goToNext();
      }
    }

    // Reset
    touchStartX.current = null;
    touchStartY.current = null;
    isSwiping.current = false;
    swipeOffsetRef.current = 0;
    setSwipeOffset(0);
  }, [goToNext, goToPrevious]);

  const currentImage = images[currentIndex];

  if (!currentImage) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center overflow-hidden"
      style={{
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Close button */}
      <motion.button
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-4 right-4 z-20 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </motion.button>

      {/* Image container */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-4 md:p-6 overflow-hidden"
        style={{
          maxWidth: '100vw',
          maxHeight: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Previous button */}
        {images.length > 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: isHovered ? 1 : 0.7,
              x: isHovered ? 0 : -20
            }}
            transition={{ duration: 0.2 }}
            className="absolute left-2 md:left-4 z-20"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="bg-white/10 hover:bg-white/20 text-white h-10 w-10 md:h-14 md:w-14 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 shadow-lg touch-manipulation"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 md:h-7 md:w-7" />
            </Button>
          </motion.div>
        )}

        {/* Image */}
        <div 
          className="relative w-full h-full flex items-center justify-center touch-none overflow-hidden"
          style={{
            maxWidth: '100vw',
            maxHeight: '100vh',
            padding: '0',
            margin: '0',
            overflow: 'hidden',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={(dir) => ({ 
                opacity: 0, 
                x: dir === "right" ? 100 : -100,
                scale: 0.95
              })}
              animate={{ 
                opacity: 1, 
                x: swipeOffset,
                scale: 1
              }}
              exit={(dir) => ({ 
                opacity: 0, 
                x: dir === "right" ? -100 : 100,
                scale: 0.95
              })}
              transition={{ 
                duration: isSwiping.current ? 0 : 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="relative flex items-center justify-center w-full h-full"
              style={{
                cursor: isSwiping.current ? 'grabbing' : 'grab',
                maxWidth: 'calc(100vw - 2rem)',
                maxHeight: 'calc(100vh - 8rem)',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
              }}
            >
              <Image
                src={currentImage}
                alt={title ? `${title} - Image ${currentIndex + 1}` : `Gallery image ${currentIndex + 1}`}
                fill
                className={cn(
                  "object-contain select-none transition-opacity duration-300",
                  isLoading && "opacity-0"
                )}
                sizes="100vw"
                priority={currentIndex < 3}
                onLoad={() => setIsLoading(false)}
                draggable={false}
                style={{
                  objectFit: 'contain',
                  objectPosition: 'center',
                  width: '100%',
                  height: '100%',
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next button */}
        {images.length > 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ 
              opacity: isHovered ? 1 : 0.7,
              x: isHovered ? 0 : 20
            }}
            transition={{ duration: 0.2 }}
            className="absolute right-2 md:right-4 z-20"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="bg-white/10 hover:bg-white/20 text-white h-10 w-10 md:h-14 md:w-14 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 shadow-lg touch-manipulation"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 md:h-7 md:w-7" />
            </Button>
          </motion.div>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium"
          >
            {currentIndex + 1} / {images.length}
          </motion.div>
        )}

        {/* Video Platform Buttons - Positioned above thumbnails or at bottom if no thumbnails */}
        {(youtubeUrl || instagramUrl) && (
          <div className={`absolute ${images.length > 1 ? 'bottom-20' : 'bottom-4'} left-1/2 transform -translate-x-1/2 flex gap-2 z-10`}>
            {youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 shadow-md text-xs sm:text-sm font-medium"
                aria-label="Watch on YouTube"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>Watch on YouTube</span>
              </a>
            )}
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 shadow-md text-xs sm:text-sm font-medium"
                aria-label="View on Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>View on Instagram</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Thumbnail strip at bottom */}
      {images.length > 1 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 pb-2 overflow-hidden">
          <div 
            className="flex gap-2 overflow-x-auto scrollbar-hide px-2 py-2"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {images.map((image, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? "right" : "left");
                  setCurrentIndex(index);
                  setIsLoading(true);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 flex-shrink-0",
                  currentIndex === index
                    ? "border-primary scale-110 ring-2 ring-primary/50"
                    : "border-transparent opacity-60 hover:opacity-100 hover:border-white/30"
                )}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                  sizes="64px"
                />
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


