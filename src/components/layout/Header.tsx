"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/components/shared/ThemeProvider";
import { ShareButton } from "@/components/shared/ShareButton";

const navigation = [
  { name: "Home", href: "/" },
  { name: "News", href: "/news" },
  { name: "Events", href: "/events" },
  { name: "Gallery", href: "/gallery" },
  { name: "Quick Contact", href: "/quick-contact" },
  { name: "RWA", href: "/rwa" },
  { name: "Advertisements", href: "/advertisements" },
  { name: "Notifications", href: "/notifications" },
  { name: "Policies", href: "/policies" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const theme = useTheme();
  const logoUrl = theme?.logo;
  const faviconUrl = theme?.favicon;
  const siteName = theme?.siteName || "Greenwood City Block C";
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Detect scroll position for mobile
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between py-1.5 sm:py-1.5 md:py-2 px-4 lg:px-8" aria-label="Global">
        {/* Icon/Logo and Site Name on the left */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 lg:flex-none">
          {(logoUrl || faviconUrl) && (
            <Link
              href="/"
              className="flex items-center touch-manipulation min-h-[44px] min-w-[44px]"
              aria-label="Go to homepage"
            >
              <div className="relative h-[40px] w-[40px] sm:h-[54px] sm:w-[54px] md:h-[68px] md:w-[68px] flex-shrink-0">
                <Image
                  src={logoUrl || faviconUrl || ""}
                  alt={theme?.siteName || "Logo"}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 40px, (max-width: 768px) 54px, 68px"
                  priority
                />
              </div>
          </Link>
          )}
          
          {/* Site Name - shown on mobile when scrolled */}
          {isScrolled && (
            <Link
              href="/"
              className="lg:hidden"
              aria-label="Go to homepage"
            >
              <h1 className="text-xs sm:text-sm font-semibold text-text truncate max-w-[200px]">
                {siteName}
              </h1>
            </Link>
          )}
        </div>

        {/* Share button - Mobile only */}
        <div className="lg:hidden flex items-center">
          <ShareButton variant="icon" size="sm" />
        </div>

        {/* Navigation links in the center/right */}
        <div className="hidden lg:flex lg:gap-x-6 flex-1 justify-end">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-text hover:text-primary transition-colors touch-manipulation touch-target tap-feedback flex items-center whitespace-nowrap"
              aria-label={`Navigate to ${item.name}`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
