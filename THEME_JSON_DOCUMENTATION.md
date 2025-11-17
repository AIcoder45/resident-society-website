# Mobile-Only Theme JSON Files Documentation

This directory contains theme JSON files **specifically designed for mobile view only** (320px - 480px viewport width). These themes are optimized for smartphone screens and follow modern mobile app design patterns inspired by magazine/news applications.

## ⚠️ Important: Mobile-Only Implementation

**This theme is designed exclusively for mobile devices.** It assumes:
- Viewport width: 320px - 480px (typical smartphone screens)
- Touch-based interactions (no hover states)
- Vertical scrolling layout
- Single-column layouts
- Bottom navigation bar
- Mobile-first typography and spacing

**Do not use these themes for desktop or tablet views.** For responsive designs, you'll need separate theme configurations.

## Files Overview

### 1. `theme-mobile.json`
**Purpose:** Core mobile-only theme configuration  
**Contains:**
- Color palette optimized for mobile screens
- Mobile typography system (sizes optimized for small screens)
- Spacing system (8px grid, mobile-optimized)
- Shadows and border radius (mobile-appropriate)
- Component base styles (touch-friendly)
- Mobile-specific settings (safe areas, touch targets)

**Usage:** Base theme for all mobile components (320px - 480px viewport)

### 2. `theme-responsive.json`
**Purpose:** Mobile viewport variations  
**Contains:**
- Mobile viewport sizes (small: 320px, medium: 375px, large: 480px)
- Typography scales for different mobile screen sizes
- Spacing adjustments for small vs large mobile screens
- Component overrides for mobile optimization

**Usage:** For fine-tuning across different mobile screen sizes (still mobile-only)

### 3. `theme-components.json`
**Purpose:** Mobile-optimized component configurations  
**Contains:**
- Card styles (single-column, full-width on mobile)
- Navigation components (bottom nav optimized for thumbs)
- Badge styles (mobile-readable sizes)
- Button variants (touch-friendly, 44px minimum)
- List item styles (mobile-optimized spacing)
- Hero section styles (mobile viewport height)
- Grid layouts (single column for mobile)

**Usage:** Component-level styling for mobile-only implementation

## Mobile-Only Design Principles

### Viewport Specifications
- **Target Width:** 320px - 480px (smartphone screens)
- **Orientation:** Portrait mode (primary)
- **Layout:** Single column, full-width components
- **Scrolling:** Vertical only
- **No Desktop Features:** No hover states, no multi-column grids, no desktop navigation

### Color System (Mobile-Optimized)
- **Primary Green:** `#2F855A` (High contrast for mobile readability)
- **Accent Yellow:** `#FFD700` (Bright, visible on small screens)
- **Background:** `#FFFFFF` (Clean white, reduces eye strain)
- **Text:** `#1A202C` (Dark gray, WCAG AA compliant)
- **Status Colors:** Green (verified), Red (emergency), Yellow (featured)
- **Contrast Ratios:** All colors meet WCAG 2.1 AA standards for mobile

### Typography (Mobile-First)
- **Serif Fonts:** For headlines (18px - 24px on mobile)
- **Sans-serif Fonts:** For body text and UI (16px base, prevents iOS zoom)
- **Base Size:** 16px (prevents auto-zoom on iOS Safari)
- **Line Height:** 1.5-1.6 (optimized for mobile reading)
- **Font Sizes:** Scaled for 320px - 480px viewports only
- **No Desktop Scaling:** Typography assumes mobile screen density

### Spacing (Mobile-Optimized)
- **8px Grid System:** All spacing based on 8px increments
- **Mobile Margins:** 16px (standard), 12px (compact), 20px (spacious)
- **Touch Targets:** Minimum 44x44px (Apple HIG / Material Design)
- **Component Padding:** 16px - 20px (thumb-friendly)
- **Section Spacing:** 24px - 32px (comfortable scrolling)

### Components (Mobile-Only)

#### Cards
- **Full Width:** Cards span 100% width minus 16px margins
- **Single Column:** No multi-column layouts
- **Rounded Corners:** 12px (mobile-appropriate)
- **Touch Feedback:** Active states (no hover)
- **Image Overlays:** Dark gradients for text readability
- **Height:** Auto-height, content-driven

#### Navigation
- **Bottom Nav:** 64px height (thumb-zone optimized)
- **Top Nav:** 56px height (status bar clearance)
- **Fixed Position:** Always visible, doesn't scroll
- **Touch Targets:** 44px minimum per icon
- **Active States:** Clear visual indicators (color, background)
- **No Desktop Menu:** Hamburger menu for mobile drawer

#### Buttons
- **Full Width:** Primary buttons span full width on mobile
- **Height:** 44px minimum (touch-friendly)
- **Padding:** 12px vertical, 24px horizontal
- **Touch Feedback:** Active/pressed states only
- **No Hover:** Touch-based interactions only
- **Spacing:** 8px between buttons

#### Lists
- **Single Column:** Always vertical layout
- **Thumbnail Size:** 80px x 80px (mobile-optimized)
- **Item Height:** Minimum 80px (comfortable tap)
- **Spacing:** 16px between items
- **Full Width:** List items span container width

## Mobile-Only Implementation Guide

### Viewport Meta Tag (Required)
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```
**Note:** `user-scalable=no` prevents zoom, ensuring consistent mobile layout.

### Using with Strapi Theme (Mobile-Only)
1. Import theme JSON files
2. Map colors to Strapi theme fields
3. **Apply mobile viewport constraints** (max-width: 480px)
4. Use mobile-optimized component styles
5. **Disable desktop breakpoints** in Strapi config

### Using with CSS/Tailwind (Mobile-Only)
1. Extract color values to CSS variables
2. Map typography to Tailwind config (mobile sizes only)
3. Create utility classes from spacing
4. Apply component classes with `max-width: 480px` constraint
5. **Use Tailwind's mobile-first approach** but cap at mobile sizes

### Using with React Components (Mobile-Only)
1. Import theme JSON
2. Use theme values in styled-components or CSS-in-JS
3. **Wrap app in mobile viewport container** (max-width: 480px)
4. Use component-specific mobile styles
5. **Remove desktop breakpoint logic**

### Mobile Viewport Container Example
```typescript
// Wrap your app in this container
<div style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
  {/* Your mobile-only app */}
</div>
```

## Example Usage

### TypeScript/JavaScript
```typescript
import theme from './theme-mobile.json';

const cardStyle = {
  backgroundColor: theme.colors.background.default,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing.scale[4],
  boxShadow: theme.shadows.default,
};
```

### CSS Variables
```css
:root {
  --color-primary: #2F855A;
  --color-accent: #FFD700;
  --spacing-base: 8px;
  --font-serif: Georgia, serif;
  --font-sans: Inter, sans-serif;
}
```

### Tailwind Config
```javascript
module.exports = {
  theme: {
    extend: {
      colors: theme.colors.palette,
      fontFamily: theme.typography.fontFamily,
      spacing: theme.spacing.scale,
    }
  }
}
```

## Mobile-Only Features

### Viewport Constraints
- **Maximum Width:** 480px (enforced via CSS)
- **Orientation Lock:** Portrait mode recommended
- **No Desktop Scaling:** Fixed mobile layout
- **Centered Container:** App centered on larger screens (with max-width constraint)

### Safe Area Support
- Respects device safe areas (notches, home indicators)
- Uses `env(safe-area-inset-*)` CSS variables
- Bottom nav padding: `padding-bottom: calc(16px + env(safe-area-inset-bottom))`
- Top nav padding: `padding-top: calc(8px + env(safe-area-inset-top))`

### Touch Interactions (Mobile-Only)
- **No Hover States:** All interactions are touch-based
- **Active States:** Visual feedback on tap/press
- **Touch Targets:** Minimum 44x44px for all interactive elements
- **Spacing:** 8px minimum between touch targets
- **Tap Feedback:** 0.1s visual feedback on interaction

### Mobile-Optimized Images
- **Optimized Sizes:** 320px, 375px, 480px widths
- **Lazy Loading:** Below-the-fold images lazy loaded
- **Format:** WebP with JPEG fallback
- **Aspect Ratios:** 16:9 for hero, 1:1 for thumbnails
- **File Size:** Maximum 200KB per image

### Performance (Mobile-First)
- **Smooth Animations:** Transform and opacity only (GPU-accelerated)
- **Optimized Transitions:** 200ms - 300ms duration
- **Efficient Rendering:** Virtual scrolling for long lists
- **Minimal JavaScript:** Reduce bundle size for mobile networks
- **Progressive Loading:** Critical CSS inline, rest deferred

### Mobile Navigation Patterns
- **Bottom Navigation:** Primary navigation at bottom (thumb-zone)
- **Hamburger Menu:** Secondary navigation in drawer
- **Swipe Gestures:** Swipe left/right for navigation (optional)
- **Pull to Refresh:** Standard mobile pattern
- **Infinite Scroll:** For content feeds

## Mobile-Only Best Practices

1. **Always use theme values** - Don't hardcode colors or spacing
2. **Follow 8px grid** - Maintain consistent spacing
3. **Touch-friendly** - Ensure 44px minimum targets (Apple HIG standard)
4. **Mobile-only testing** - Test on actual mobile devices (320px - 480px)
5. **Accessible** - Maintain WCAG 2.1 AA contrast ratios
6. **Performance** - Optimize for 3G/4G mobile networks
7. **No desktop features** - Remove hover states, multi-column layouts
8. **Viewport constraint** - Enforce max-width: 480px
9. **Portrait orientation** - Design for portrait mode primarily
10. **Safe areas** - Respect device notches and home indicators

## Implementation Checklist

### Setup
- [ ] Add viewport meta tag with mobile constraints
- [ ] Set max-width: 480px on app container
- [ ] Import mobile theme JSON files
- [ ] Configure CSS variables from theme
- [ ] Set up mobile-only breakpoints (320px, 375px, 480px)

### Components
- [ ] Bottom navigation bar (64px height)
- [ ] Top header (56px height)
- [ ] Mobile-optimized cards (full width, single column)
- [ ] Touch-friendly buttons (44px minimum height)
- [ ] Mobile list items (80px thumbnails, full width)
- [ ] Safe area padding for navigation

### Testing
- [ ] Test on iPhone SE (320px width)
- [ ] Test on iPhone 12/13 (375px width)
- [ ] Test on iPhone Pro Max (428px width)
- [ ] Test on Android devices (360px - 480px)
- [ ] Verify touch targets (44px minimum)
- [ ] Check safe area insets (notches, home indicators)
- [ ] Test portrait orientation
- [ ] Verify no horizontal scrolling

## Updates

When updating mobile-only themes:
1. Update all three JSON files consistently
2. Document breaking changes
3. Test on actual mobile devices (320px - 480px)
4. Verify accessibility compliance (WCAG 2.1 AA)
5. Test touch interactions (no hover states)
6. Verify safe area support
7. Check performance on mobile networks

