/**
 * Contrast Ratio Utilities
 * Implements WCAG 2.1 contrast ratio calculations and validation
 * WCAG AA requires 4.5:1 for normal text, 3:1 for large text
 */

/**
 * Converts hex color to RGB values
 * @param hex - Hex color string (e.g., "#FF0000" or "FF0000")
 * @returns RGB values [r, g, b] or null if invalid
 */
export function hexToRgb(hex: string): [number, number, number] | null {
  // Remove # if present
  const cleanHex = hex.replace("#", "");
  
  // Validate hex format
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    return null;
  }
  
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return [r, g, b];
}

/**
 * Calculates relative luminance of a color
 * Based on WCAG 2.1 formula: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 * @param rgb - RGB values [r, g, b]
 * @returns Relative luminance (0-1)
 */
export function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((val) => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates contrast ratio between two colors
 * @param color1 - First color (hex string)
 * @param color2 - Second color (hex string)
 * @returns Contrast ratio (1-21) or null if invalid colors
 */
export function getContrastRatio(
  color1: string,
  color2: string,
): number | null {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    return null;
  }
  
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks if contrast ratio meets WCAG AA standards
 * @param ratio - Contrast ratio
 * @param isLargeText - Whether text is large (18px+ or 14px+ bold)
 * @returns true if meets WCAG AA (4.5:1 for normal, 3:1 for large)
 */
export function meetsWCAGAA(ratio: number, isLargeText = false): boolean {
  if (isLargeText) {
    return ratio >= 3.0;
  }
  return ratio >= 4.5;
}

/**
 * Checks if contrast ratio meets WCAG AAA standards
 * @param ratio - Contrast ratio
 * @param isLargeText - Whether text is large (18px+ or 14px+ bold)
 * @returns true if meets WCAG AAA (7:1 for normal, 4.5:1 for large)
 */
export function meetsWCAGAAA(ratio: number, isLargeText = false): boolean {
  if (isLargeText) {
    return ratio >= 4.5;
  }
  return ratio >= 7.0;
}

/**
 * Validates contrast between text and background colors
 * @param textColor - Text color (hex string)
 * @param backgroundColor - Background color (hex string)
 * @param isLargeText - Whether text is large (18px+ or 14px+ bold)
 * @returns Validation result with ratio and compliance status
 */
export function validateContrast(
  textColor: string,
  backgroundColor: string,
  isLargeText = false,
): {
  ratio: number | null;
  meetsAA: boolean;
  meetsAAA: boolean;
  level: "AA" | "AAA" | "FAIL";
  message: string;
} {
  const ratio = getContrastRatio(textColor, backgroundColor);
  
  if (ratio === null) {
    return {
      ratio: null,
      meetsAA: false,
      meetsAAA: false,
      level: "FAIL",
      message: "Invalid color format",
    };
  }
  
  const aa = meetsWCAGAA(ratio, isLargeText);
  const aaa = meetsWCAGAAA(ratio, isLargeText);
  
  let level: "AA" | "AAA" | "FAIL";
  if (aaa) {
    level = "AAA";
  } else if (aa) {
    level = "AA";
  } else {
    level = "FAIL";
  }
  
  const required = isLargeText ? 3.0 : 4.5;
  const message = aa
    ? `Contrast ratio ${ratio.toFixed(2)}:1 meets WCAG ${level} (requires ${required}:1)`
    : `Contrast ratio ${ratio.toFixed(2)}:1 fails WCAG AA (requires ${required}:1)`;
  
  return {
    ratio,
    meetsAA: aa,
    meetsAAA: aaa,
    level,
    message,
  };
}

/**
 * Validates theme color combinations
 * @param theme - Theme object with color properties
 * @returns Array of validation results for each color combination
 */
export interface ThemeContrastValidation {
  combination: string;
  textColor: string;
  backgroundColor: string;
  result: ReturnType<typeof validateContrast>;
}

export function validateThemeContrast(theme: {
  textColor?: string;
  textColorLight?: string;
  backgroundColor?: string;
  backgroundColorDark?: string;
  primaryColor?: string;
  primaryColorDark?: string;
  primaryColorLight?: string;
}): ThemeContrastValidation[] {
  const validations: ThemeContrastValidation[] = [];
  
  // Default fallback colors (from tailwind.config.ts)
  const defaultText = "#1A202C";
  const defaultTextLight = "#4A5568";
  const defaultBackground = "#F0FFF4";
  const defaultBackgroundDark = "#C6F6D5";
  const defaultPrimary = "#2F855A";
  
  const textColor = theme.textColor || defaultText;
  const textColorLight = theme.textColorLight || defaultTextLight;
  const backgroundColor = theme.backgroundColor || defaultBackground;
  const backgroundColorDark = theme.backgroundColorDark || defaultBackgroundDark;
  const primaryColor = theme.primaryColor || defaultPrimary;
  
  // Critical combinations to validate
  const combinations = [
    {
      name: "Text on Background",
      text: textColor,
      bg: backgroundColor,
      large: false,
    },
    {
      name: "Text Light on Background",
      text: textColorLight,
      bg: backgroundColor,
      large: false,
    },
    {
      name: "Text on Background Dark",
      text: textColor,
      bg: backgroundColorDark,
      large: false,
    },
    {
      name: "Primary Text on Background",
      text: primaryColor,
      bg: backgroundColor,
      large: false,
    },
    {
      name: "White Text on Primary",
      text: "#FFFFFF",
      bg: primaryColor,
      large: false,
    },
    {
      name: "Heading on Background (Large Text)",
      text: textColor,
      bg: backgroundColor,
      large: true,
    },
  ];
  
  combinations.forEach((combo) => {
    validations.push({
      combination: combo.name,
      textColor: combo.text,
      backgroundColor: combo.bg,
      result: validateContrast(combo.text, combo.bg, combo.large),
    });
  });
  
  return validations;
}

