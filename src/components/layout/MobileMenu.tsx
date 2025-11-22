"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Newspaper, 
  Calendar, 
  Image, 
  Users, 
  Megaphone, 
  Bell, 
  FileText,
  Phone,
  X,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "News", href: "/news", icon: Newspaper },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Gallery", href: "/gallery", icon: Image },
  { name: "RWA", href: "/rwa", icon: Users },
  { name: "Advertisements", href: "/advertisements", icon: Megaphone },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Policies", href: "/policies", icon: FileText },
  { name: "Contact Us", href: "/contact", icon: Phone },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile Menu Component
 * Full-screen mobile menu with smooth animations and large touch targets
 */
export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
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
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-text">Menu</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 py-4">
                {navigation.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || 
                    (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-4 px-6 py-4 min-h-[56px] transition-colors touch-manipulation",
                        isActive 
                          ? "bg-primary/10 border-l-4 border-primary text-primary" 
                          : "hover:bg-gray-50 text-text"
                      )}
                    >
                      <Icon className={cn(
                        "h-6 w-6 flex-shrink-0",
                        isActive ? "text-primary" : "text-gray-600"
                      )} />
                      <span className={cn(
                        "font-medium flex-1",
                        isActive && "font-semibold"
                      )}>
                        {item.name}
                      </span>
                      <ChevronRight className={cn(
                        "h-5 w-5 text-gray-400 flex-shrink-0",
                        isActive && "text-primary"
                      )} />
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  Block C
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

