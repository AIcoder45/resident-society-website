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
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div
      className={cn("relative w-full h-full overflow-hidden", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => {
        setTimeout(() => setIsPaused(false), autoPlayInterval * 2);
      }}
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
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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

