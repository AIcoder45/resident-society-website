import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BreadcrumbItem } from "@/types";

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-2 sm:mb-3 md:mb-4">
      <ol className="flex items-center space-x-1 sm:space-x-2 text-[10px] sm:text-xs md:text-sm text-text-light">
        <li>
          <Link
            href="/"
            className="flex items-center hover:text-primary transition-colors touch-manipulation min-h-[32px] min-w-[32px] justify-center"
            aria-label="Home"
          >
            <Home className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mx-1 sm:mx-1.5 md:mx-2" />
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-primary transition-colors touch-manipulation"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-text font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

