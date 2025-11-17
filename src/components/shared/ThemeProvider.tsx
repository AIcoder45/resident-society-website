"use client";

import * as React from "react";
import type { Theme } from "@/types";
import { validateThemeContrast } from "@/lib/utils/contrast";

// Mobile-only theme constants
const MOBILE_VIEWPORT_MAX_WIDTH = "480px";
const MOBILE_VIEWPORT_MIN_WIDTH = "320px";
const MOBILE_ACCENT_YELLOW = "#FFD700";

interface ThemeProviderProps {
  theme: Theme | null;
  children: React.ReactNode;
}

/**
 * Theme Context for accessing theme data in client components
 */
export const ThemeContext = React.createContext<Theme | null>(null);

/**
 * Hook to access theme data in client components
 */
export function useTheme() {
  return React.useContext(ThemeContext);
}

/**
 * Theme Provider Component
 * Injects CSS variables from Strapi theme data into the document
 * Also provides theme data via context for client components
 * Validates contrast ratios for WCAG compliance
 * Applies mobile-only theme constraints (320px - 480px)
 */
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  React.useEffect(() => {
    const root = document.documentElement;

    // Apply mobile-only viewport constraint
    root.style.setProperty("--viewport-max-width", MOBILE_VIEWPORT_MAX_WIDTH);
    root.style.setProperty("--viewport-min-width", MOBILE_VIEWPORT_MIN_WIDTH);

    if (!theme) {
      // Use default theme if no theme data
      return;
    }

    // Set CSS variables for colors from API theme
    root.style.setProperty("--color-primary", theme.primaryColor);
    root.style.setProperty("--color-primary-dark", theme.primaryColorDark || theme.primaryColor);
    root.style.setProperty("--color-primary-light", theme.primaryColorLight || theme.primaryColor);
    
    if (theme.secondaryColor) {
      root.style.setProperty("--color-secondary", theme.secondaryColor);
    }
    
    root.style.setProperty("--color-background", theme.backgroundColor);
    root.style.setProperty("--color-background-dark", theme.backgroundColorDark || theme.backgroundColor);
    
    root.style.setProperty("--color-text", theme.textColor);
    root.style.setProperty("--color-text-light", theme.textColorLight || theme.textColor);
    
    root.style.setProperty("--color-theme", theme.themeColor);
    
    // Accent color from API or fallback to yellow from mobile theme
    if (theme.accentColor) {
      root.style.setProperty("--color-accent", theme.accentColor);
    } else {
      root.style.setProperty("--color-accent", MOBILE_ACCENT_YELLOW);
    }
    
    if (theme.errorColor) {
      root.style.setProperty("--color-error", theme.errorColor);
    }
    
    if (theme.successColor) {
      root.style.setProperty("--color-success", theme.successColor);
    }
    
    if (theme.warningColor) {
      root.style.setProperty("--color-warning", theme.warningColor);
    }
    
    if (theme.infoColor) {
      root.style.setProperty("--color-info", theme.infoColor);
    }

    // Update theme color meta tag for PWA
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", theme.themeColor);
    }

    // Validate contrast ratios (development only)
    if (process.env.NODE_ENV === "development") {
      const validations = validateThemeContrast(theme);
      const failures = validations.filter((v) => !v.result.meetsAA);
      
      if (failures.length > 0) {
        console.warn(
          "⚠️ WCAG Contrast Ratio Warnings:",
          `\n${failures.length} color combination(s) fail WCAG AA standards:`,
        );
        failures.forEach((failure) => {
          console.warn(
            `  • ${failure.combination}: ${failure.result.message}`,
            `\n    Text: ${failure.textColor} on Background: ${failure.backgroundColor}`,
          );
        });
        console.warn(
          "\n💡 Tip: Ensure contrast ratio ≥4.5:1 for normal text, ≥3:1 for large text (18px+ or 14px+ bold)",
        );
      } else {
        console.log(
          "✅ All theme color combinations meet WCAG AA contrast requirements",
        );
      }
      
      // Store validation results in data attribute for debugging
      root.setAttribute(
        "data-contrast-validations",
        JSON.stringify(validations),
      );
    }

    // Cleanup function to restore defaults if theme changes
    return () => {
      // Could restore defaults here if needed
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      <div className="mobile-viewport-container">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
