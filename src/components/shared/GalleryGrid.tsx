"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ImageCarousel } from "@/components/shared/ImageCarousel";
import { GalleryCardCarousel } from "@/components/shared/GalleryCardCarousel";
import type { GalleryItem } from "@/types";

/**
 * Strip HTML tags and limit text to approximately 30 words
 * Returns plain text (same as ContentCard and EventCard)
 */
function limitWords(text: string, maxWords: number = 30): string {
  if (!text) return "";
  
  // Strip HTML tags and convert to plain text
  const textWithoutHtml = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = textWithoutHtml.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length <= maxWords) return textWithoutHtml;
  return words.slice(0, maxWords).join(" ") + "...";
}

export interface GalleryGridProps {
  items: GalleryItem[];
  columns?: 2 | 3 | 4;
  className?: string;
  useCarousel?: boolean;
  compact?: boolean;
}

/**
 * Masonry-style gallery grid component
 * Displays gallery items in a responsive grid layout
 */
export function GalleryGrid({
  items,
  columns = 3,
  className,
  useCarousel = false,
  compact = false,
}: GalleryGridProps) {
  const [selectedGalleryItem, setSelectedGalleryItem] = React.useState<{
    item: GalleryItem;
    initialIndex: number;
  } | null>(null);

  const handleImageClick = (item: GalleryItem, imageIndex: number) => {
    setSelectedGalleryItem({
      item,
      initialIndex: imageIndex,
    });
  };

  const gridCols = {
    2: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <>
      <div className={cn("grid gap-2 sm:gap-3 md:gap-4 w-full", gridCols[columns], className)}>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="w-full min-w-0"
          >
            <Card className={cn(
              "w-full h-full overflow-hidden flex flex-col",
              "bg-white border border-gray-200/60 rounded-xl",
              "transition-all duration-300 ease-out",
              "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30",
              "active:scale-[0.98] sm:active:scale-100",
              "group cursor-pointer"
            )}>
              {item.images && item.images.length > 0 && (
                <div
                  className={cn(
                    "relative w-full overflow-hidden cursor-pointer touch-manipulation flex-shrink-0",
                    "bg-gradient-to-br from-gray-100 to-gray-200",
                    compact ? "h-[72px] sm:h-[80px] md:h-[88px]" : "h-[96px] sm:h-[104px] md:h-[112px]"
                  )}
                  onClick={() => handleImageClick(item, 0)}
                >
                  <GalleryCardCarousel
                    images={item.images}
                    alt={item.title}
                    autoPlayInterval={3000}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}
              <div className={cn(
                "flex flex-col flex-1",
                compact ? "p-2" : "p-2.5 sm:p-3"
              )}>
                <h3 className={cn(
                  "line-clamp-2 leading-tight font-semibold text-text mb-1",
                  "group-hover:text-primary transition-colors duration-200",
                  compact ? "text-[10px] sm:text-xs" : "text-xs sm:text-sm"
                )}>{item.title}</h3>
                {item.description && (
                  <p className={cn(
                    "text-text-light leading-snug flex-1",
                    "line-clamp-3",
                    compact ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-xs"
                  )}>
                    {limitWords(item.description, 30)}
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Image Carousel Modal */}
      {selectedGalleryItem && (
        <ImageCarousel
          images={selectedGalleryItem.item.images}
          title={selectedGalleryItem.item.title}
          initialIndex={selectedGalleryItem.initialIndex}
          onClose={() => setSelectedGalleryItem(null)}
        />
      )}
    </>
  );
}
