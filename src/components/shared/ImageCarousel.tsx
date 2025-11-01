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
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [isLoading, setIsLoading] = React.useState(true);

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
  }, [currentIndex]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsLoading(true);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsLoading(true);
  };

  const currentImage = images[currentIndex];

  if (!currentImage) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Image container */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Previous button */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-4 z-10 bg-white/10 hover:bg-white/20 text-white h-12 w-12 rounded-full"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}

        {/* Image */}
        <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <Image
                src={currentImage}
                alt={title ? `${title} - Image ${currentIndex + 1}` : `Gallery image ${currentIndex + 1}`}
                fill
                className={cn(
                  "object-contain",
                  isLoading && "opacity-0"
                )}
                sizes="(max-width: 768px) 100vw, 90vw"
                priority={currentIndex < 3}
                onLoad={() => setIsLoading(false)}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next button */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-4 z-10 bg-white/10 hover:bg-white/20 text-white h-12 w-12 rounded-full"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip at bottom */}
      {images.length > 1 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-4xl overflow-x-auto px-4 pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsLoading(true);
              }}
              className={cn(
                "relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                currentIndex === index
                  ? "border-primary scale-110"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

