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

  // Auto-play functionality
  React.useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [images.length, autoPlayInterval]);

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div className={cn("relative w-full overflow-hidden flex justify-center z-0 lg:mt-[10px]", className)}>
      <div className="relative aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/9] w-full lg:w-[54%] lg:aspect-[16/5.4]">
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

        {/* Dots indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  currentIndex === index
                    ? "w-6 sm:w-8 h-1.5 sm:h-2 bg-white"
                    : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

