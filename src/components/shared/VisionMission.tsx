"use client";

import Image from "next/image";
import { RichTextContent } from "./RichTextContent";
import { cn } from "@/lib/utils";
import { Quote } from "lucide-react";
import { motion } from "framer-motion";

export interface VisionMissionProps {
  visionTitle: string;
  visionContent: string; // HTML content
  missionTitle?: string;
  missionContent?: string;
  visionImage?: string;
  missionImage?: string;
  className?: string;
}

/**
 * Vision section component - Testimonial style
 * Displays vision in an elegant, testimonial-like format
 */
export function VisionMission({
  visionTitle,
  visionContent,
  visionImage,
  className,
}: VisionMissionProps) {
  return (
    <section className={cn("w-full bg-gradient-to-b from-background to-gray-50/50 py-1 sm:py-1.5 md:py-2", className)}>
      <div className="mx-auto max-w-lg px-2 sm:px-2.5 lg:px-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Image (if available) */}
          {visionImage && (
            <div className="relative w-full max-w-lg mx-auto aspect-[16/9] mb-1 sm:mb-1.5 rounded-md overflow-hidden shadow-sm">
              <Image
                src={visionImage}
                alt={visionTitle}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          )}

          {/* Quote-style Content */}
          <div className="relative max-w-lg mx-auto py-1 sm:py-1.5">
            {/* Decorative Quote Mark - Top Left */}
            <div className="absolute -top-0.5 -left-0.5 sm:-top-1 sm:-left-0.5 text-primary/15">
              <Quote className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 rotate-180" />
            </div>

            {/* Content */}
            <div className="relative px-1 sm:px-1.5 md:px-2">
              <div className="text-[10px] sm:text-[14px] md:text-[16px] text-text leading-relaxed text-center font-medium">
                <div className="[&_p]:text-center [&_p]:mb-1 [&_p:last-child]:mb-0 [&_p]:text-[10px] [&_p]:sm:text-[14px] [&_p]:md:text-[16px] [&_*]:text-[10px] [&_*]:sm:text-[14px] [&_*]:md:text-[16px]">
                  <RichTextContent content={visionContent} />
                </div>
              </div>
            </div>

            {/* Closing Quote Mark - Bottom Right */}
            <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-0.5 text-primary/15">
              <Quote className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

