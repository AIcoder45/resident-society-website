"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Megaphone, Bell, FileText, Phone, X, ChevronLeft, Image } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const moreNavItems = [
  { name: "Gallery", href: "/gallery", icon: Image },
  { name: "RWA", href: "/rwa", icon: Users },
  { name: "Advertisements", href: "/advertisements", icon: Megaphone },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Policies", href: "/policies", icon: FileText },
  { name: "Contact", href: "/contact", icon: Phone },
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
            className="fixed bottom-0 left-0 right-0 rounded-t-3xl shadow-2xl z-50 lg:hidden max-h-[80vh] overflow-y-auto safe-area-inset-bottom"
            style={{
              backgroundColor: 'var(--magazine-bg-default, #FFFFFF)',
              borderTopLeftRadius: 'var(--magazine-radius-lg, 15px)',
              borderTopRightRadius: 'var(--magazine-radius-lg, 15px)',
            }}
          >
            <div className="flex flex-col">
              {/* Handle Bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div 
                  className="w-12 h-1.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--magazine-text-tertiary, #8B939C)',
                  }}
                />
              </div>

              {/* Header */}
              <div 
                className="flex items-center justify-between px-6 pb-4"
                style={{
                  borderBottom: '1px solid var(--magazine-bg-border, #DEE3EA)',
                  paddingLeft: 'var(--magazine-spacing-3xl, 23px)',
                  paddingRight: 'var(--magazine-spacing-3xl, 23px)',
                }}
              >
                <h2 
                  className="text-xl font-bold"
                  style={{
                    fontFamily: 'var(--magazine-font-heading, Gelasio, Arial)',
                    fontSize: 'var(--magazine-font-5xl, 1.688rem)',
                    fontWeight: 500,
                    color: 'var(--magazine-text-primary, #000000)',
                  }}
                >
                  More
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="py-4">
                {moreNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || 
                    (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-4 min-h-[56px] transition-colors touch-manipulation"
                      style={{
                        padding: 'var(--magazine-spacing-2xl, 20px) var(--magazine-spacing-3xl, 23px)',
                        backgroundColor: isActive ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                        borderLeft: isActive ? '4px solid var(--magazine-text-primary, #000000)' : 'none',
                      }}
                    >
                      <Icon 
                        className="h-6 w-6 flex-shrink-0"
                        style={{
                          color: isActive 
                            ? 'var(--magazine-text-primary, #000000)' 
                            : 'var(--magazine-text-tertiary, #8B939C)'
                        }}
                      />
                      <span 
                        className="flex-1"
                        style={{
                          fontFamily: 'var(--magazine-font-body, Fredoka, Arial)',
                          fontSize: 'var(--magazine-font-lg, 0.938rem)',
                          fontWeight: isActive ? 600 : 400,
                          color: isActive 
                            ? 'var(--magazine-text-primary, #000000)' 
                            : 'var(--magazine-text-primary, #000000)'
                        }}
                      >
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


