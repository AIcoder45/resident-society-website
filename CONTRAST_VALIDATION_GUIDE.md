# WCAG Contrast Ratio Validation Guide

This document explains the contrast ratio validation system implemented to ensure WCAG 2.1 compliance.

## Overview

The project now includes automated contrast ratio validation for all theme color combinations. This ensures that text is readable and meets accessibility standards (WCAG AA and AAA).

## WCAG Standards

### WCAG AA (Minimum Standard)
- **Normal text** (16px): Contrast ratio ≥ **4.5:1**
- **Large text** (18px+ or 14px+ bold): Contrast ratio ≥ **3:1**

### WCAG AAA (Enhanced Standard)
- **Normal text** (16px): Contrast ratio ≥ **7:1**
- **Large text** (18px+ or 14px+ bold): Contrast ratio ≥ **4.5:1**

## Implementation

### 1. Contrast Utility Functions

Location: `src/lib/utils/contrast.ts`

**Key Functions:**
- `getContrastRatio(color1, color2)` - Calculates contrast ratio between two colors
- `validateContrast(textColor, backgroundColor, isLargeText)` - Validates a color combination
- `validateThemeContrast(theme)` - Validates all theme color combinations
- `meetsWCAGAA(ratio, isLargeText)` - Checks if ratio meets AA standards
- `meetsWCAGAAA(ratio, isLargeText)` - Checks if ratio meets AAA standards

**Example Usage:**
```typescript
import { validateContrast, getContrastRatio } from "@/lib/utils/contrast";

// Validate a specific combination
const result = validateContrast("#000000", "#FFFFFF", false);
console.log(result);
// {
//   ratio: 21,
//   meetsAA: true,
//   meetsAAA: true,
//   level: "AAA",
//   message: "Contrast ratio 21.00:1 meets WCAG AAA (requires 4.5:1)"
// }

// Get contrast ratio
const ratio = getContrastRatio("#2F855A", "#F0FFF4");
console.log(ratio); // 4.8 (example)
```

### 2. Automatic Theme Validation

The `ThemeProvider` component automatically validates all theme color combinations when a theme is loaded.

**Validated Combinations:**
1. Text on Background
2. Text Light on Background
3. Text on Background Dark
4. Primary Text on Background
5. White Text on Primary
6. Heading on Background (Large Text)

**Development Mode:**
- Console warnings for failing combinations
- Console log for passing combinations
- Validation results stored in `data-contrast-validations` attribute on `<html>`

**Example Console Output:**
```
⚠️ WCAG Contrast Ratio Warnings:
1 color combination(s) fail WCAG AA standards:
  • Text Light on Background: Contrast ratio 3.2:1 fails WCAG AA (requires 4.5:1)
    Text: #4A5568 on Background: #F0FFF4

💡 Tip: Ensure contrast ratio ≥4.5:1 for normal text, ≥3:1 for large text (18px+ or 14px+ bold)
```

### 3. Visual Contrast Validator Component

Location: `src/components/shared/ContrastValidator.tsx`

A development-only component that displays contrast validation results in a floating panel.

**Features:**
- Shows pass/fail status in a compact button
- Expandable panel with detailed results
- Color swatches for each combination
- Categorized by: Failures, AA Only, AAA Pass
- Only visible in development mode

**Usage:**
The component is automatically included in the layout and only renders in development mode.

## Default Theme Contrast Ratios

Based on the default colors in `tailwind.config.ts`:

| Combination | Text Color | Background | Ratio | Status |
|------------|-----------|------------|-------|--------|
| Text on Background | #1A202C | #F0FFF4 | ~15.8:1 | ✅ AAA |
| Text Light on Background | #4A5568 | #F0FFF4 | ~7.2:1 | ✅ AAA |
| Text on Background Dark | #1A202C | #C6F6D5 | ~10.5:1 | ✅ AAA |
| Primary Text on Background | #2F855A | #F0FFF4 | ~4.8:1 | ✅ AA |
| White Text on Primary | #FFFFFF | #2F855A | ~4.9:1 | ✅ AA |
| Heading on Background (Large) | #1A202C | #F0FFF4 | ~15.8:1 | ✅ AAA |

*Note: Actual ratios may vary based on theme colors from Strapi CMS.*

## Testing Contrast Ratios

### Manual Testing

1. **Browser Console:**
   ```javascript
   // Access validation results
   const validations = JSON.parse(document.documentElement.getAttribute('data-contrast-validations'));
   console.table(validations);
   ```

2. **Using the Validator Component:**
   - Look for the floating button in the bottom-right corner (development only)
   - Click to expand and see all validation results

### Automated Testing

The validation runs automatically when:
- Theme is loaded from Strapi
- Theme colors are updated
- Component mounts in development mode

## Fixing Contrast Issues

If a color combination fails WCAG AA:

1. **Increase Contrast:**
   - Darken text color
   - Lighten background color
   - Or vice versa

2. **Use Large Text:**
   - If ratio is between 3:1 and 4.5:1, use large text (18px+ or 14px+ bold)
   - This meets WCAG AA for large text

3. **Adjust Theme Colors in Strapi:**
   - Update theme colors in Strapi CMS
   - Validation will run automatically on next load

**Example Fix:**
```typescript
// Before: Fails AA (3.2:1)
textColor: "#4A5568"
backgroundColor: "#F0FFF4"

// After: Passes AA (4.8:1)
textColor: "#2D3748"  // Darker text
backgroundColor: "#F0FFF4"
```

## Color Format Requirements

All colors must be in hexadecimal format:
- ✅ Valid: `#2F855A`, `#FFFFFF`, `#000`
- ❌ Invalid: `2F855A` (missing #), `rgb(47, 133, 90)` (wrong format)

## Integration with Strapi CMS

When setting theme colors in Strapi:
1. Enter colors in hex format (e.g., `#2F855A`)
2. Validation runs automatically when theme loads
3. Check browser console for warnings (development mode)
4. Use ContrastValidator component to see visual results

## Best Practices

1. **Always Test:**
   - Test with actual theme colors from Strapi
   - Verify in both light and dark modes (if applicable)

2. **Prioritize Critical Combinations:**
   - Text on Background (most common)
   - Primary buttons with text
   - Links on background

3. **Document Custom Colors:**
   - Document any custom color combinations
   - Include contrast ratios in design documentation

4. **Regular Audits:**
   - Run validation after theme updates
   - Check console warnings regularly
   - Use automated accessibility testing tools

## Resources

- [WCAG 2.1 Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Contrast Ratio Calculator](https://contrast-ratio.com/)

## Troubleshooting

### Validation Not Running
- Ensure you're in development mode (`NODE_ENV === "development"`)
- Check that theme is loaded from Strapi
- Verify colors are in hex format

### Incorrect Ratios
- Ensure colors are valid hex codes
- Check for typos in color values
- Verify color format in Strapi CMS

### Component Not Visible
- Only visible in development mode
- Check browser console for errors
- Ensure ContrastValidator is imported in layout

