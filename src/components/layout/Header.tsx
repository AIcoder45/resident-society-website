"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/components/shared/ThemeProvider";
import { HeaderMarquee } from "./HeaderMarquee";
import type { Event } from "@/types";

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
  const [upcomingEvents, setUpcomingEvents] = React.useState<Event[]>([]);

  // Fetch upcoming events on mount
  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events/upcoming");
        if (response.ok) {
          const data = await response.json();
          setUpcomingEvents(data.events || []);
        }
      } catch (error) {
        console.error("Failed to fetch upcoming events:", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto flex max-w-[640px] items-center justify-center py-1 sm:py-1 lg:py-0 px-4 lg:px-8" aria-label="Global">
        {/* Mobile Layout: Logo + Marquee centered */}
        <div className="flex lg:hidden items-center justify-center flex-1 min-w-0 gap-2">
          {/* Icon/Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {(logoUrl || faviconUrl) && (
            <Link
              href="/"
                className="flex items-center touch-manipulation min-h-[32px] min-w-[32px]"
              aria-label="Go to homepage"
            >
                <div className="relative h-[60px] w-[60px] sm:h-[72px] sm:w-[72px] md:h-[84px] md:w-[84px] flex-shrink-0">
                <Image
                  src={logoUrl || faviconUrl || ""}
                  alt={theme?.siteName || "Logo"}
                  fill
                  className="object-contain"
                    sizes="(max-width: 640px) 60px, (max-width: 768px) 72px, (max-width: 1024px) 84px"
                  priority
                />
              </div>
          </Link>
          )}
          </div>
          
          {/* Marquee for upcoming events - Mobile only */}
          <HeaderMarquee events={upcomingEvents} />
        </div>

        {/* Desktop Layout: Logo + Navigation centered */}
        <div className="hidden lg:flex items-center justify-center gap-6 w-full">
          {/* Icon/Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {(logoUrl || faviconUrl) && (
          <Link
            href="/"
                className="flex items-center touch-manipulation min-h-[20px] min-w-[20px]"
            aria-label="Go to homepage"
          >
                <div className="relative h-[66px] w-[66px] flex-shrink-0">
                  <Image
                    src={logoUrl || faviconUrl || ""}
                    alt={theme?.siteName || "Logo"}
                    fill
                    className="object-contain"
                    sizes="66px"
                    priority
                  />
                </div>
          </Link>
            )}
        </div>

          {/* Navigation links */}
          <div className="flex gap-x-6 items-center">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-xs font-semibold leading-5 text-text hover:text-primary transition-colors touch-manipulation touch-target tap-feedback flex items-center whitespace-nowrap"
              aria-label={`Navigate to ${item.name}`}
            >
              {item.name}
            </Link>
          ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
