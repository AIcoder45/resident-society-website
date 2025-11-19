# Share Button Component Usage Guide

## Overview

The `ShareButton` component provides social media sharing functionality across all pages. It supports multiple sharing platforms and uses the Web Share API on mobile devices for native sharing.

## Features

- ✅ **Web Share API** - Native sharing on mobile devices (iOS/Android)
- ✅ **Facebook** - Share to Facebook
- ✅ **Twitter/X** - Share to Twitter/X
- ✅ **WhatsApp** - Share via WhatsApp
- ✅ **LinkedIn** - Share to LinkedIn
- ✅ **Email** - Share via email
- ✅ **Copy Link** - Copy page URL to clipboard

## Variants

### 1. Floating Button (Default on all pages)
A floating button that appears in the bottom-right corner on all pages.

```tsx
<ShareButton variant="floating" />
```

### 2. Inline Button
A button that can be placed inline with other content.

```tsx
<ShareButton variant="inline" />
```

### 3. Icon Only
Just the share icon without text.

```tsx
<ShareButton variant="icon" />
```

## Props

```typescript
interface ShareButtonProps {
  url?: string;           // Custom URL to share (defaults to current page)
  title?: string;         // Custom title (defaults to page title)
  description?: string;   // Custom description (defaults to meta description)
  className?: string;     // Additional CSS classes
  variant?: "floating" | "inline" | "icon";  // Button variant
  size?: "sm" | "default" | "lg";            // Button size
}
```

## Usage Examples

### Basic Usage (Auto-detects page info)
```tsx
import { ShareButton } from "@/components/shared/ShareButton";

<ShareButton />
```

### Custom URL and Title
```tsx
<ShareButton 
  url="https://greenwoodscity.in/news/article-slug"
  title="Check out this article"
  description="Read about our latest community updates"
/>
```

### Inline Button in Article
```tsx
<article>
  <h1>Article Title</h1>
  <div className="flex gap-2">
    <ShareButton variant="inline" />
    <Button>Read More</Button>
  </div>
  <p>Article content...</p>
</article>
```

### Icon Button in Header
```tsx
<header>
  <ShareButton variant="icon" size="sm" />
</header>
```

## Current Implementation

The ShareButton is automatically added to all pages via the root layout (`src/app/layout.tsx`) as a floating button. It appears in the bottom-right corner:

- **Mobile**: Above the bottom navigation (bottom-20)
- **Desktop**: Bottom-right corner (bottom-8)

## Customization

### Change Position
```tsx
<ShareButton 
  variant="floating" 
  className="bottom-24 right-6" 
/>
```

### Change Size
```tsx
<ShareButton size="lg" />
```

### Add to Specific Pages Only
Remove from layout and add to individual pages:

```tsx
// In page component
import { ShareButton } from "@/components/shared/ShareButton";

export default function MyPage() {
  return (
    <div>
      <h1>Page Title</h1>
      <ShareButton variant="inline" />
      {/* Page content */}
    </div>
  );
}
```

## Browser Support

- ✅ **Web Share API**: iOS Safari, Chrome Android, Edge Android
- ✅ **Social Media Links**: All modern browsers
- ✅ **Copy to Clipboard**: Modern browsers (with fallback for older browsers)

## Accessibility

- ✅ ARIA labels for screen readers
- ✅ Keyboard navigation support
- ✅ Touch-friendly (44px minimum touch target)
- ✅ Focus states for keyboard users

## Notes

- The component automatically detects the current page URL, title, and description
- On mobile devices with Web Share API support, the native share sheet will appear
- Social media links open in popup windows (600x400px)
- Copy link shows a confirmation message for 2 seconds

