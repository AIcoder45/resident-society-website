"use client";

import * as React from "react";
import type { Theme } from "@/types";

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
 */
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  React.useEffect(() => {
    if (!theme) {
      // Use default theme if no theme data
      return;
    }

    const root = document.documentElement;

    // Set CSS variables for colors
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
    
    if (theme.accentColor) {
      root.style.setProperty("--color-accent", theme.accentColor);
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

    // Cleanup function to restore defaults if theme changes
    return () => {
      // Could restore defaults here if needed
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

