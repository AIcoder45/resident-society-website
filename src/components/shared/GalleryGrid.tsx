"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ImageCarousel } from "@/components/shared/ImageCarousel";
import type { GalleryItem } from "@/types";

export interface GalleryGridProps {
  items: GalleryItem[];
  columns?: 2 | 3 | 4;
  className?: string;
  useCarousel?: boolean;
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
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <>
      <div className={cn("grid gap-4 w-full", gridCols[columns], className)}>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="w-full min-w-0"
          >
            <Card className="w-full h-full overflow-hidden hover:shadow-lg transition-shadow">
              {item.images[0] && (
                <div
                  className="relative w-full aspect-square overflow-hidden cursor-pointer"
                  onClick={() => handleImageClick(item, 0)}
                >
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {item.images.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageClick(item, 0);
                      }}
                      className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-xs font-semibold hover:bg-primary/90 transition-colors"
                    >
                      +{item.images.length - 1}
                    </button>
                  )}
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-text mb-1">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-text-light line-clamp-2">
                    {item.description}
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
