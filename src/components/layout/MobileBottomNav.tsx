"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, Calendar, Image, MoreVertical, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileMoreMenu } from "./MobileMoreMenu";

const mobileNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "News", href: "/news", icon: Newspaper },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Quick Contact", href: "/quick-contact", icon: Wrench },
  { name: "More", href: "#", icon: MoreVertical },
];

/**
 * Mobile Bottom Navigation Bar
 * App-like bottom navigation for mobile devices
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreMenuOpen, setMoreMenuOpen] = React.useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg lg:hidden safe-area-inset-bottom">
      <div className="grid grid-cols-5 h-16">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== "#" && pathname.startsWith(item.href));
          
          if (item.href === "#") {
            return (
              <React.Fragment key={item.name}>
                <button
                  onClick={() => setMoreMenuOpen(true)}
                  className={cn(
                    "flex flex-col items-center justify-center min-h-[44px] touch-manipulation transition-colors",
                    moreMenuOpen && "text-primary"
                  )}
                  aria-label={item.name}
                >
                  <Icon className={cn(
                    "h-6 w-6 mb-1 transition-colors",
                    moreMenuOpen ? "text-primary" : "text-gray-500"
                  )} />
                  <span className={cn(
                    "text-xs font-medium transition-colors",
                    moreMenuOpen ? "text-primary" : "text-gray-500"
                  )}>
                    {item.name}
                  </span>
                </button>
                <MobileMoreMenu isOpen={moreMenuOpen} onClose={() => setMoreMenuOpen(false)} />
              </React.Fragment>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-h-[44px] touch-manipulation transition-colors",
                isActive && "bg-primary/5"
              )}
              aria-label={`Navigate to ${item.name}`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn(
                "h-6 w-6 mb-1 transition-colors",
                isActive ? "text-primary" : "text-gray-500"
              )} />
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-gray-500"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

