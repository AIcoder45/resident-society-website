"use client";

import * as React from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

export interface ImageCarouselProps {
  images: string[];
  title?: string;
  initialIndex?: number;
  onClose?: () => void;
  youtubeUrl?: string;
  instagramUrl?: string;
}

/**
 * Lightweight image preview using yet-another-react-lightbox
 *
 * - Uses Next/Image with object-contain so ALL aspect ratios fit (portrait, landscape, panorama)
 * - Thumbnails stay pinned to the bottom on mobile and desktop
 * - Keyboard, swipe, and mouse navigation handled by the library
 * - Keeps the original props shape so existing gallery code keeps working
 */
export function ImageCarousel({
  images,
  title,
  initialIndex = 0,
  onClose,
  youtubeUrl,
  instagramUrl,
}: ImageCarouselProps) {
  const [index, setIndex] = React.useState(initialIndex);

  // Keep local index in sync if caller changes initialIndex
  React.useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex, images.length]);

  if (!images || images.length === 0) return null;

  const slides = React.useMemo(
    () =>
      images.map((src, i) => ({
        src,
        alt: title
          ? `${title} - Image ${i + 1}`
          : `Gallery image ${i + 1}`,
      })),
    [images, title],
  );

  const handleClose = React.useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <Lightbox
      // Old component opened whenever it was rendered, so we keep that behaviour
      open
      close={handleClose}
      index={index}
      slides={slides}
      plugins={[Thumbnails]}
      thumbnails={{ position: "bottom" }}
      animation={{ fade: 250 }}
      controller={{
        closeOnBackdropClick: true,
        closeOnPullDown: true,
      }}
      // Keep index in sync when the user navigates inside the lightbox
      on={{
        view: ({ index: newIndex }) => setIndex(newIndex),
      }}
      render={{
        // Custom slide renderer so we can keep using Next/Image with object-contain
        slide: ({ slide }) => (
          <div className="relative flex h-full w-full items-center justify-center bg-black">
            <Image
              src={slide.src}
              alt={slide.alt ?? ""}
              fill
              className="object-contain"
              sizes="100vw"
              priority={false}
            />
          </div>
        ),
        // Custom toolbar with title + optional social links
        toolbar: ({ close }) => (
          <div className="pointer-events-none absolute top-0 left-0 right-0 z-30 flex items-start justify-between px-3 py-3">
            {/* Left: Title */}
            {title && (
              <div className="pointer-events-auto max-w-[65%] rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white shadow-md backdrop-blur">
                {title}
              </div>
            )}

            <div className="pointer-events-auto flex items-center gap-2">
              {/* Optional video / social buttons */}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden rounded-full bg-red-600 px-3 py-1 text-[11px] font-medium text-white shadow-sm transition hover:bg-red-700 sm:inline-flex sm:items-center sm:gap-1"
                >
                  <span>YouTube</span>
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 px-3 py-1 text-[11px] font-medium text-white shadow-sm transition hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 sm:inline-flex sm:items-center sm:gap-1"
                >
                  <span>Instagram</span>
                </a>
              )}

              {/* Close button */}
              <button
                type="button"
                onClick={close}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white shadow-md backdrop-blur transition hover:bg-black"
                aria-label="Close image preview"
              >
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>
          </div>
        ),
      }}
      styles={{
        // Ensure the lightbox always fills the viewport cleanly on mobile
        root: { backgroundColor: "rgba(0,0,0,0.95)" },
        container: { backgroundColor: "transparent" },
      }}
    />
  );
}



