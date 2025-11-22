"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FeaturedImage {
  src: string;
  alt: string;
  href: string;
}

export interface FeaturedImageCarouselProps {
  images: FeaturedImage[];
  className?: string;
  autoPlayInterval?: number; // in milliseconds
}

/**
 * Auto-playing featured image carousel
 * Displays images in a carousel that auto-advances every 3 seconds
 */
export function FeaturedImageCarousel({
  images,
  className,
  autoPlayInterval = 3000, // 3 seconds default
}: FeaturedImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const goToNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsPaused(true);
    // Resume auto-play after 5 seconds of inactivity
    setTimeout(() => setIsPaused(false), 5000);
  }, [images.length]);

  const goToPrevious = React.useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsPaused(true);
    // Resume auto-play after 5 seconds of inactivity
    setTimeout(() => setIsPaused(false), 5000);
  }, [images.length]);

  // Auto-play functionality
  React.useEffect(() => {
    if (images.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [images.length, autoPlayInterval, isPaused]);

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious]);

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div className={cn("relative w-full overflow-hidden flex justify-center z-0 lg:mt-[10px]", className)}>
      <div 
        className="relative aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/9] w-full lg:w-[54%] lg:aspect-[16/5.4]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <Link
              href={currentImage.href}
              className="block w-full h-full group"
            >
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="100vw"
                priority
                unoptimized={currentImage.src.startsWith("/") && !currentImage.src.startsWith("http")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              {/* Optional: Add title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                <h3 className="text-white text-sm sm:text-base md:text-lg font-semibold line-clamp-2 drop-shadow-lg">
                  {currentImage.alt}
                </h3>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

