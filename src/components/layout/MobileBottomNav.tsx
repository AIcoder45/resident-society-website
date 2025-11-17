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
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden safe-area-inset-bottom"
      style={{
        height: 'var(--magazine-bottom-nav-height, 74px)',
        backgroundColor: 'var(--magazine-bg-default, #FFFFFF)',
        borderTop: '1px solid var(--magazine-bg-border, #DEE3EA)',
        filter: 'var(--magazine-shadow-default, drop-shadow(12.0px 1.47px 6px rgba(64,64,64,0.3)))',
      }}
    >
      <div className="grid grid-cols-5" style={{ height: '100%' }}>
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
                  <Icon 
                    className="h-6 w-6 mb-1 transition-colors"
                    style={{
                      color: moreMenuOpen 
                        ? 'var(--magazine-text-primary, #000000)' 
                        : 'var(--magazine-text-quaternary, #939CA7)'
                    }}
                  />
                  <span 
                    className="text-xs font-medium transition-colors"
                    style={{
                      fontFamily: 'var(--magazine-font-body, Fredoka, Arial)',
                      fontSize: 'var(--magazine-font-base, 0.75rem)',
                      color: moreMenuOpen 
                        ? 'var(--magazine-text-primary, #000000)' 
                        : 'var(--magazine-text-quaternary, #939CA7)'
                    }}
                  >
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
              className="flex flex-col items-center justify-center min-h-[44px] touch-manipulation transition-colors"
              style={{
                backgroundColor: isActive ? 'rgba(0, 0, 0, 0.05)' : 'transparent'
              }}
              aria-label={`Navigate to ${item.name}`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon 
                className="h-6 w-6 mb-1 transition-colors"
                style={{
                  color: isActive 
                    ? 'var(--magazine-text-primary, #000000)' 
                    : 'var(--magazine-text-quaternary, #939CA7)'
                }}
              />
              <span 
                className="text-xs font-medium transition-colors"
                style={{
                  fontFamily: 'var(--magazine-font-body, Fredoka, Arial)',
                  fontSize: 'var(--magazine-font-base, 0.75rem)',
                  fontWeight: isActive ? 700 : 400,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: isActive 
                    ? 'var(--magazine-text-primary, #000000)' 
                    : 'var(--magazine-text-quaternary, #939CA7)'
                }}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

