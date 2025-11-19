"use client";

import * as React from "react";
import { Share2, Facebook, Twitter, MessageCircle, Linkedin, Mail, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface ShareButtonProps {
  url?: string;
  title?: string;
  description?: string;
  className?: string;
  variant?: "floating" | "inline" | "icon";
  size?: "sm" | "default" | "lg";
}

/**
 * Share Button Component
 * Provides social media sharing functionality with Web Share API fallback
 * Supports: Facebook, Twitter/X, WhatsApp, LinkedIn, Email, Copy Link
 */
export function ShareButton({
  url,
  title,
  description,
  className,
  variant = "inline",
  size = "default",
}: ShareButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [shareUrl, setShareUrl] = React.useState<string>("");
  const [shareTitle, setShareTitle] = React.useState<string>("");
  const [shareDescription, setShareDescription] = React.useState<string>("");
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Get current page info on client side
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUrl = url || window.location.href;
      const currentTitle = title || document.title;
      const currentDescription = description || 
        document.querySelector('meta[name="description"]')?.getAttribute("content") || 
        "";

      setShareUrl(currentUrl);
      setShareTitle(currentTitle);
      setShareDescription(currentDescription);
    }
  }, [url, title, description]);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Check if Web Share API is available
  const canUseWebShare = typeof navigator !== "undefined" && "share" in navigator;

  // Web Share API (native sharing on mobile)
  const handleWebShare = async () => {
    if (!canUseWebShare) return;

    try {
      await navigator.share({
        title: shareTitle,
        text: shareDescription,
        url: shareUrl,
      });
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error sharing:", error);
      }
    }
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }
      document.body.removeChild(textArea);
    }
  };

  // Social media share URLs
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareDescription}\n\n${shareUrl}`)}`,
  };

  const handleSocialShare = (platform: keyof typeof shareLinks) => {
    const link = shareLinks[platform];
    if (link) {
      window.open(link, "_blank", "width=600,height=400,noopener,noreferrer");
      setIsOpen(false);
    }
  };

  const shareOptions = [
    { id: "web-share", label: "More Options", icon: Share2, onClick: handleWebShare, show: canUseWebShare, bgColor: "bg-gray-100", iconColor: "text-gray-700" },
    { id: "facebook", label: "Facebook", icon: Facebook, onClick: () => handleSocialShare("facebook"), bgColor: "bg-blue-50", iconColor: "text-blue-600" },
    { id: "twitter", label: "Twitter/X", icon: Twitter, onClick: () => handleSocialShare("twitter"), bgColor: "bg-sky-50", iconColor: "text-sky-500" },
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, onClick: () => handleSocialShare("whatsapp"), bgColor: "bg-green-50", iconColor: "text-green-600" },
    { id: "linkedin", label: "LinkedIn", icon: Linkedin, onClick: () => handleSocialShare("linkedin"), bgColor: "bg-blue-50", iconColor: "text-blue-700" },
    { id: "email", label: "Email", icon: Mail, onClick: () => handleSocialShare("email"), bgColor: "bg-gray-50", iconColor: "text-gray-700" },
    { id: "copy", label: copied ? "Copied!" : "Copy Link", icon: copied ? Check : Copy, onClick: handleCopyLink, bgColor: copied ? "bg-green-50" : "bg-gray-50", iconColor: copied ? "text-green-600" : "text-gray-700" },
  ].filter(option => option.show !== false);

  // Floating button variant
  if (variant === "floating") {
    return (
      <>
        {/* Backdrop overlay - separate from menuRef to cover full screen */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[59]"
              onClick={() => setIsOpen(false)}
            />
          )}
        </AnimatePresence>

        <div className={cn("hidden lg:block fixed bottom-8 right-6 z-[60]", className)} ref={menuRef} style={{ position: 'fixed' }}>
          <Button
            size="default"
            className={cn(
              "h-6 w-6 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95",
              isOpen 
                ? "!bg-gray-700 !text-white rotate-45" 
                : "!bg-primary !text-white hover:!bg-primary-dark"
            )}
            aria-label="Share page"
            onClick={() => setIsOpen(!isOpen)}
            type="button"
          >
            {isOpen ? (
              <X className="h-3 w-3" />
            ) : (
              <Share2 className="h-3 w-3" strokeWidth={2.5} />
            )}
          </Button>
          
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute bottom-full right-0 mb-2 w-64 sm:w-72 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="px-3 py-1.5 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-xs font-semibold text-gray-900">Share this page</h3>
                </div>

                {/* Options */}
                <div className="py-1">
                  {shareOptions.map((option, index) => {
                    const Icon = option.icon;
                    return (
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={option.onClick}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-all touch-manipulation min-h-[36px]",
                          "hover:bg-gray-50 active:bg-gray-100",
                          option.bgColor
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center h-5 w-5 rounded-md flex-shrink-0",
                          option.bgColor
                        )}>
                          <Icon className={cn("h-3 w-3", option.iconColor)} />
                        </div>
                        <span className="text-gray-900 flex-1 text-left">{option.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </>
    );
  }

  // Icon-only variant
  if (variant === "icon") {
    return (
      <>
        {/* Backdrop overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[59]"
              onClick={() => setIsOpen(false)}
            />
          )}
        </AnimatePresence>

        <div className={cn("relative", className)} ref={menuRef}>
          <Button
            variant="ghost"
            size={size}
            className={cn(
              "touch-manipulation",
              isOpen && "text-primary"
            )}
            aria-label="Share page"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="h-2 w-2 sm:h-3 sm:w-3" />
            ) : (
              <Share2 className="h-2 w-2 sm:h-3 sm:w-3" strokeWidth={2.5} />
            )}
          </Button>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-[60]"
              >
                {/* Header */}
                <div className="px-3 py-1.5 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-xs font-semibold text-gray-900">Share this page</h3>
                </div>

                {/* Options */}
                <div className="py-1">
                  {shareOptions.map((option, index) => {
                    const Icon = option.icon;
                    return (
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={option.onClick}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-all touch-manipulation min-h-[36px]",
                          "hover:bg-gray-50 active:bg-gray-100",
                          option.bgColor
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center h-5 w-5 rounded-md flex-shrink-0",
                          option.bgColor
                        )}>
                          <Icon className={cn("h-3 w-3", option.iconColor)} />
                        </div>
                        <span className="text-gray-900 flex-1 text-left">{option.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </>
    );
  }

  // Inline variant (default)
  return (
    <div className={cn("relative inline-block", className)} ref={menuRef}>
      <Button
        variant="outline"
        size={size}
        className="touch-manipulation"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
            >
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={option.onClick}
                    className="w-full flex items-center px-4 py-3 text-sm text-left hover:bg-gray-100 transition-colors touch-manipulation min-h-[44px]"
                  >
                    <Icon className={cn("h-4 w-4 mr-3 flex-shrink-0", option.color)} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

