"use client";

import * as React from "react";
import Link from "next/link";

const navigation = [
  { name: "Home", href: "/" },
  { name: "News", href: "/news" },
  { name: "Events", href: "/events" },
  { name: "Gallery", href: "/gallery" },
  { name: "RWA", href: "/rwa" },
  { name: "Advertisements", href: "/advertisements" },
  { name: "Notifications", href: "/notifications" },
  { name: "Policies", href: "/policies" },
  { name: "Contact", href: "/contact" },
];

export function Header() {

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-end p-4 lg:px-8" aria-label="Global">
        <div className="hidden lg:flex lg:gap-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-text hover:text-primary transition-colors touch-manipulation min-h-[44px] flex items-center"
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
