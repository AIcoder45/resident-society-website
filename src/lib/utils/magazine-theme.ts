/**
 * Magazine Theme Utility
 * Loads and provides access to the magazine theme from theme-components.json
 * This theme is specifically designed for mobile view (430px max width)
 */

import themeComponents from '../../../theme-components.json';

export type MagazineTheme = typeof themeComponents;

/**
 * Get the complete magazine theme
 */
export function getMagazineTheme(): MagazineTheme {
  return themeComponents;
}

/**
 * Get magazine theme colors
 */
export function getMagazineColors() {
  return themeComponents.colors;
}

/**
 * Get magazine typography settings
 */
export function getMagazineTypography() {
  return themeComponents.typography;
}

/**
 * Get magazine component styles for a specific screen
 */
export function getScreenStyles(screen: 'home' | 'favorites' | 'notifications' | 'account') {
  return themeComponents.components.screens[screen];
}

/**
 * Get magazine navigation styles
 */
export function getNavigationStyles() {
  return themeComponents.components.navigation;
}

/**
 * Get magazine heading styles
 */
export function getHeadingStyles(level: 'h1' | 'h2' | 'h3' = 'h1') {
  return themeComponents.components.heading[level];
}

/**
 * Get magazine body text styles
 */
export function getBodyStyles(variant: 'default' | 'small' | 'meta' = 'default') {
  return themeComponents.components.body[variant];
}

/**
 * Get magazine badge styles
 */
export function getBadgeStyles() {
  return themeComponents.components.badge.featured;
}

/**
 * Convert pt to px (approximate conversion)
 */
export function ptToPx(pt: string): string {
  const ptValue = parseFloat(pt.replace('pt', ''));
  return `${(ptValue * 1.33).toFixed(0)}px`;
}

/**
 * Convert pt to rem (approximate conversion)
 */
export function ptToRem(pt: string): string {
  const ptValue = parseFloat(pt.replace('pt', ''));
  return `${(ptValue / 12).toFixed(3)}rem`;
}

