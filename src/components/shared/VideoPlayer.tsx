"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  video?: string; // Direct video URL
  youtubeUrl?: string; // YouTube URL
  instagramUrl?: string; // Instagram URL
  image?: string; // Thumbnail image for YouTube/Instagram
  className?: string;
}

/**
 * Video Player Component
 * Handles YouTube embeds, Instagram embeds, and direct video playback
 */
export function VideoPlayer({
  video,
  youtubeUrl,
  instagramUrl,
  image,
  className,
}: VideoPlayerProps) {
  // Priority: YouTube > Instagram > Direct Video
  const hasVideo = youtubeUrl || instagramUrl || video;
  const [isPlaying, setIsPlaying] = React.useState(false);

  if (!hasVideo) return null;

  // Extract YouTube video ID from various URL formats
  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // Extract Instagram post/reel ID from URL
  const getInstagramEmbedUrl = (url: string): string => {
    // Instagram embed URLs format: https://www.instagram.com/p/{POST_ID}/embed/
    // or https://www.instagram.com/reel/{REEL_ID}/embed/
    const postMatch = url.match(/instagram\.com\/p\/([^\/\?]+)/);
    const reelMatch = url.match(/instagram\.com\/reel\/([^\/\?]+)/);
    
    if (postMatch) {
      return `https://www.instagram.com/p/${postMatch[1]}/embed/`;
    } else if (reelMatch) {
      return `https://www.instagram.com/reel/${reelMatch[1]}/embed/`;
    }
    
    // If URL already contains /embed/, use it as-is
    if (url.includes("/embed/")) {
      return url;
    }
    
    // Fallback: try to construct embed URL
    return url.replace(/\/$/, "") + "/embed/";
  };

  // Render YouTube embed
  if (youtubeUrl) {
    const videoId = getYouTubeVideoId(youtubeUrl);
    if (videoId) {
      // Show thumbnail with play button, then embed on click
      if (!isPlaying && image) {
        return (
          <div className={cn("relative w-full aspect-video overflow-hidden rounded-lg group cursor-pointer", className)}>
            <Image
              src={image}
              alt="Video thumbnail"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 800px"
              unoptimized={image.startsWith("/") && !image.startsWith("http")}
            />
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors"
              onClick={() => setIsPlaying(true)}
            >
              <div className="bg-red-600 rounded-full p-3 sm:p-4 md:p-5 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>Watch on YouTube</span>
            </div>
          </div>
        );
      }

      return (
        <div className={cn("relative w-full aspect-video overflow-hidden rounded-lg", className)}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      );
    }
  }

  // Render Instagram embed
  if (instagramUrl) {
    const embedUrl = getInstagramEmbedUrl(instagramUrl);
    
    // Show thumbnail with play button, then embed on click
    if (!isPlaying && image) {
      return (
        <div className={cn("relative w-full aspect-square max-w-md mx-auto overflow-hidden rounded-lg group cursor-pointer", className)}>
          <Image
            src={image}
            alt="Instagram post thumbnail"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 500px"
            unoptimized={image.startsWith("/") && !image.startsWith("http")}
          />
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors"
            onClick={() => setIsPlaying(true)}
          >
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full p-3 sm:p-4 md:p-5 group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>View on Instagram</span>
          </div>
        </div>
      );
    }

    return (
      <div className={cn("relative w-full overflow-hidden rounded-lg", className)}>
        <div className="relative" style={{ paddingBottom: "100%" }}>
          <iframe
            src={embedUrl}
            title="Instagram post"
            allow="encrypted-media"
            className="absolute inset-0 w-full h-full"
            style={{ minHeight: "400px" }}
          />
        </div>
      </div>
    );
  }

  // Render direct video
  if (video) {
    return (
      <div className={cn("relative w-full aspect-video overflow-hidden rounded-lg", className)}>
        <video
          controls
          className="w-full h-full"
          preload="metadata"
        >
          <source src={video} type="video/mp4" />
          <source src={video} type="video/webm" />
          <source src={video} type="video/ogg" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return null;
}

