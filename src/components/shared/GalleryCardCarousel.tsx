"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface GalleryCardCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  autoPlayInterval?: number;
}

/**
 * Mini carousel for gallery cards with multiple images
 * Auto-plays when card has multiple images
 */
export function GalleryCardCarousel({
  images,
  alt,
  className,
  autoPlayInterval = 3000, // 3 seconds default
}: GalleryCardCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const touchStartX = React.useRef<number | null>(null);
  const touchStartY = React.useRef<number | null>(null);
  const isSwiping = React.useRef(false);

  // Auto-play functionality
  React.useEffect(() => {
    if (images.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [images.length, autoPlayInterval, isPaused]);

  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      <div className={cn("relative w-full h-full", className)}>
        <Image
          src={images[0]}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 360px) 100vw, (max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
        />
      </div>
    );
  }

  const currentImage = images[currentIndex];

  // Handle swipe gestures
  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    setIsPaused(true);
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

    // Determine if this is a horizontal swipe
    if (!isSwiping.current) {
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10;
      if (isHorizontalSwipe) {
        isSwiping.current = true;
      }
    }
  }, []);

  const handleTouchEnd = React.useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) {
      touchStartX.current = null;
      touchStartY.current = null;
      setTimeout(() => setIsPaused(false), autoPlayInterval * 2);
      return;
    }

    if (isSwiping.current) {
      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX.current;
      const threshold = 30; // Minimum swipe distance

      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          // Swipe right - go to previous
          setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        } else {
          // Swipe left - go to next
          setCurrentIndex((prev) => (prev + 1) % images.length);
        }
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    isSwiping.current = false;
    setTimeout(() => setIsPaused(false), autoPlayInterval * 2);
  }, [images.length, autoPlayInterval]);

  return (
    <div
      className={cn("relative w-full h-full overflow-hidden touch-pan-y", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          <Image
            src={currentImage}
            alt={`${alt} - Image ${currentIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 360px) 100vw, (max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Dots indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
              setIsPaused(true);
              setTimeout(() => setIsPaused(false), autoPlayInterval * 2);
            }}
            className={cn(
              "rounded-full transition-all duration-300 touch-manipulation",
              currentIndex === index
                ? "w-4 h-1 bg-white"
                : "w-1 h-1 bg-white/50 hover:bg-white/75"
            )}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Image counter */}
      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-[9px] sm:text-[10px] font-semibold z-10 backdrop-blur-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}

