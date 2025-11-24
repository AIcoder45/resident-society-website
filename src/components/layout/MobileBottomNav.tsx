"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, Calendar, Bell, MoreVertical, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileMoreMenu } from "./MobileMoreMenu";

const mobileNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Society's Updates", href: "/news", icon: Newspaper },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Quick Contact", href: "/quick-contact", icon: Phone },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "More", href: "#", icon: MoreVertical },
];

/**
 * Mobile Bottom Navigation Bar
 * App-like bottom navigation for mobile devices
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const [notificationCount, setNotificationCount] = React.useState(0);
  const [moreMenuOpen, setMoreMenuOpen] = React.useState(false);

  // Fetch notifications count for today
  React.useEffect(() => {
    async function fetchNotificationCount() {
      try {
        const response = await fetch("/api/notifications/count");
        const data = await response.json();
        setNotificationCount(data.count || 0);
      } catch (error) {
        console.error("Error fetching notification count:", error);
        setNotificationCount(0);
      }
    }

    fetchNotificationCount();
    // Refresh every minute
    const interval = setInterval(fetchNotificationCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200/60 shadow-lg lg:hidden safe-area-inset-bottom">
        <div className="grid grid-cols-6 h-14 sm:h-16">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
              (item.href !== "/" && item.href !== "#" && pathname.startsWith(item.href));
            const isNotifications = item.name === "Notifications";
            const isMore = item.href === "#";
          
            if (isMore) {
            return (
              <React.Fragment key={item.name}>
                <button
                  onClick={() => setMoreMenuOpen(true)}
                  className={cn(
                      "flex flex-col items-center justify-center min-h-[44px] touch-manipulation transition-all duration-200",
                      moreMenuOpen && "bg-primary/5"
                  )}
                    aria-label="More options"
                >
                  <div className="relative flex items-center justify-center pt-1.5">
                    <Icon className={cn(
                        "h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1 transition-all duration-200",
                        moreMenuOpen ? "text-primary scale-110" : "text-gray-500"
                    )} />
                  </div>
                  <span className={cn(
                      "text-[9px] sm:text-[10px] font-medium transition-colors leading-tight",
                      moreMenuOpen ? "text-primary font-semibold" : "text-gray-600"
                  )}>
                    {item.name}
                  </span>
                </button>
                <MobileMoreMenu isOpen={moreMenuOpen} onClose={() => setMoreMenuOpen(false)} />
              </React.Fragment>
            );
          }

          const isLongText = item.name === "Society's Updates" || item.name === "Quick Contact";
          const isQuickContact = item.name === "Quick Contact";

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                  "flex flex-col items-center justify-center min-h-[44px] touch-manipulation transition-all duration-200 relative",
                isActive && "bg-primary/5"
              )}
                aria-label={`Navigate to ${item.name}${isNotifications && notificationCount > 0 ? ` (${notificationCount} new)` : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
                <div className={cn(
                  "relative flex items-center justify-center pt-1.5",
                  isLongText && "w-full -mt-0.5"
                )}>
              <Icon className={cn(
                    "h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1 transition-all duration-200",
                    isActive ? "text-primary scale-110" : "text-gray-500"
              )} />
                  {isNotifications && notificationCount > 0 && (
                    <span className={cn(
                      "absolute -top-1 -right-1 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-[8px] sm:text-[9px] min-w-[14px] sm:min-w-[16px] h-[14px] sm:h-[16px] px-1",
                      notificationCount > 9 && "text-[7px] sm:text-[8px]"
                    )}>
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  )}
                </div>
              {isQuickContact ? (
                <span className={cn(
                  "text-[9px] sm:text-[10px] font-medium transition-colors leading-tight text-center",
                  isActive ? "text-primary font-semibold" : "text-gray-600"
                )}>
                  <span className="block">Quick</span>
                  <span className="block">Contact</span>
                </span>
              ) : (
                <span className={cn(
                  "text-[9px] sm:text-[10px] font-medium transition-colors leading-tight text-center",
                  isLongText && "px-0.5",
                  isActive ? "text-primary font-semibold" : "text-gray-600"
                )}>
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
    </>
  );
}

