"use client";

import * as React from "react";
import Image from "next/image";
import { RichTextContent } from "./RichTextContent";
import { cn } from "@/lib/utils";
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
 * Vision section component - Clean and simple display
 * Displays vision content clearly without decorative quotes
 */
export function VisionMission({
  visionTitle,
  visionContent,
  visionImage,
  className,
}: VisionMissionProps) {
  // Clean content - remove leading/trailing quotes and extra whitespace
  const cleanContent = React.useMemo(() => {
    if (!visionContent) return "";
    
    // Check if content is HTML
    const isHTML = /<[^>]+>/g.test(visionContent);
    
    if (isHTML) {
      // For HTML content, clean quotes from text nodes only
      // Remove quotes that appear at the start/end of paragraph content
      return visionContent
        .replace(/<p[^>]*>["'""\s]+/gi, '<p>') // Remove quotes at start of paragraphs
        .replace(/["'""\s]+<\/p>/gi, '</p>') // Remove quotes at end of paragraphs
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    } else {
      // For plain text, remove all leading/trailing quotes
      return visionContent
        .trim()
        .replace(/^["'""]+|["'""]+$/g, '') // Remove leading/trailing quotes
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    }
  }, [visionContent]);

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

          {/* Content */}
          <div className="max-w-lg mx-auto py-1 sm:py-1.5">
            <div className="px-1 sm:px-1.5 md:px-2">
              <motion.div
                className="relative overflow-hidden rounded-lg px-2 py-1"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {/* Pulsing glow background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-50/40 via-emerald-50/50 to-green-50/40 rounded-lg"
                  animate={{
                    opacity: [0.4, 0.7, 0.4],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                {/* Shimmer highlight animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none rounded-lg"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2.5,
                    ease: 'easeInOut',
                  }}
                  style={{
                    width: '60%',
                  }}
                />
                <motion.div 
                  className="text-[10px] sm:text-[14px] md:text-[16px] text-gray-900 leading-relaxed text-center font-semibold relative z-10"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <div className="relative px-4 sm:px-6 md:px-8">
                    {/* Opening apostrophe */}
                    <motion.span
                      className="absolute -left-2 sm:-left-3 md:-left-4 top-0 text-primary text-xl sm:text-2xl md:text-3xl font-serif leading-none"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      animate={{
                        scale: [1, 1.15, 1],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: 'easeInOut',
                      }}
                    >
                      "
                    </motion.span>
                    
                    <motion.div 
                      className="[&_p]:text-center [&_p]:mb-1 [&_p:last-child]:mb-0 [&_p]:text-[10px] [&_p]:sm:text-[14px] [&_p]:md:text-[16px] [&_p]:text-gray-900 [&_p]:font-semibold [&_*]:text-[10px] [&_*]:sm:text-[14px] [&_*]:md:text-[16px] [&_*]:text-gray-900"
                      animate={{
                        opacity: [0.95, 1, 0.95],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <RichTextContent content={cleanContent} />
                    </motion.div>
                    
                    {/* Closing apostrophe */}
                    <motion.span
                      className="absolute -right-2 sm:-right-3 md:-right-4 bottom-0 text-primary text-xl sm:text-2xl md:text-3xl font-serif leading-none"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      animate={{
                        scale: [1, 1.15, 1],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: 'easeInOut',
                      }}
                    >
                      "
                    </motion.span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

