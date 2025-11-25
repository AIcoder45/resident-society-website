"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Megaphone, FileText, X, Image, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const moreNavItems = [
  { name: "Gallery", href: "/gallery", icon: Image },
  { name: "RWA", href: "/rwa", icon: Users },
  { name: "Advertisements", href: "/advertisements", icon: Megaphone },
  { name: "Policies and Documents", href: "/policies", icon: FileText },
  { name: "Contact Us", href: "/contact", icon: Phone },
];

interface MobileMoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile More Menu Component
 * Additional navigation items for mobile bottom nav "More" button
 */
export function MobileMoreMenu({ isOpen, onClose }: MobileMoreMenuProps) {
  const pathname = usePathname();

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-[60] lg:hidden safe-area-inset-bottom"
          >
            <div className="flex flex-col">
              {/* Handle Bar */}
              <div className="flex justify-center pt-2 pb-1.5">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
                <h2 className="text-base font-semibold text-text">More</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center touch-manipulation"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="py-1.5">
                {moreNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || 
                    (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2.5 px-4 py-2.5 min-h-[44px] transition-colors touch-manipulation active:bg-gray-100",
                        isActive 
                          ? "bg-primary/5 border-l-2 border-primary text-primary" 
                          : "hover:bg-gray-50 text-text"
                      )}
                    >
                      <Icon className={cn(
                        "h-4 w-4 flex-shrink-0",
                        isActive ? "text-primary" : "text-gray-600"
                      )} />
                      <span className={cn(
                        "font-medium flex-1 text-sm",
                        isActive && "font-semibold"
                      )}>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


