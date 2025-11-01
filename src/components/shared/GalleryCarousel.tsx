"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ImageCarousel } from "@/components/shared/ImageCarousel";
import type { GalleryItem } from "@/types";

export interface GalleryCarouselProps {
  items: GalleryItem[];
  className?: string;
}

/**
 * Gallery carousel component
 * Displays gallery items in a horizontal scrolling carousel
 */
export function GalleryCarousel({
  items,
  className,
}: GalleryCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedGalleryItem, setSelectedGalleryItem] = React.useState<{
    item: GalleryItem;
    initialIndex: number;
  } | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const card = container.children[index] as HTMLElement;
      if (card) {
        card.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    const newIndex = (currentIndex - 1 + items.length) % items.length;
    scrollToIndex(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % items.length;
    scrollToIndex(newIndex);
  };

  // Handle keyboard navigation
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  if (items.length === 0) return null;

  return (
    <div className={cn("relative w-full", className)}>
      {/* Carousel container */}
      <div className="relative overflow-hidden rounded-lg">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-4"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex-shrink-0 w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)] snap-center"
            >
              <div
                className="relative w-full aspect-square overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => {
                  if (item.images && item.images.length > 0) {
                    setSelectedGalleryItem({
                      item,
                      initialIndex: 0,
                    });
                  }
                }}
              >
                {item.images[0] && (
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                )}
                {item.images.length > 1 && (
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                    +{item.images.length - 1}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      {items.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg z-10"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  currentIndex === index
                    ? "bg-primary w-8"
                    : "bg-gray-300 hover:bg-gray-400"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Image Carousel Modal */}
      {selectedGalleryItem && (
        <ImageCarousel
          images={selectedGalleryItem.item.images}
          title={selectedGalleryItem.item.title}
          initialIndex={selectedGalleryItem.initialIndex}
          onClose={() => setSelectedGalleryItem(null)}
        />
      )}
    </div>
  );
}

