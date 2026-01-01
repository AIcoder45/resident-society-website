# Social Media Sharing Implementation

## Overview
This document explains the Open Graph (OG) meta tags implementation for social media sharing across News, Events, and Advertisement pages.

## What Was Implemented

### Pages Updated
1. **News Detail Page** (`/news/[slug]/page.tsx`)
2. **Events Detail Page** (`/events/[slug]/page.tsx`)
3. **Advertisement Detail Page** (`/advertisements/[id]/page.tsx`)

### Meta Tags Added

Each detail page now includes comprehensive Open Graph and Twitter Card meta tags:

#### Open Graph Meta Tags
- `og:title` - The title of the content
- `og:description` - A brief description (max 200 characters)
- `og:url` - The canonical URL of the page
- `og:siteName` - Site name (Greenwood City Block C)
- `og:image` - The primary image for social sharing
- `og:image:width` - Image width (1200px)
- `og:image:height` - Image height (630px)
- `og:image:alt` - Alt text for the image
- `og:locale` - Content locale (en_US)
- `og:type` - Content type (article/website)
- `og:publishedTime` - Publication date (for news and events)
- `og:authors` - Content authors

#### Twitter Card Meta Tags
- `twitter:card` - Card type (summary_large_image)
- `twitter:title` - Title for Twitter
- `twitter:description` - Description for Twitter
- `twitter:image` - Image for Twitter

## How It Works

### Image Selection
1. **Primary Image**: Uses the content's main image (news.image, event.coverImage, or advertisement.image)
2. **Fallback**: If no image is available, uses the site logo (`/logo.png`)
3. **URL Handling**: 
   - If image URL is already absolute (starts with http), uses it as-is
   - If relative, prepends the site URL
   - Fallback site URL: `https://greenwoodscity.in`

### Site URL Configuration
The implementation uses `NEXT_PUBLIC_SITE_URL` environment variable with fallback:
```javascript
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://greenwoodscity.in';
```

To customize the site URL, add to your `.env.local`:
```
NEXT_PUBLIC_SITE_URL=https://yoursite.com
```

### Description Handling
- **News**: Uses `shortDescription` field
- **Events**: Extracts plain text from description (strips HTML tags)
- **Advertisements**: Extracts plain text from description (strips HTML tags)
- All descriptions are limited to 200 characters for optimal social media display

## Testing Social Media Sharing

### 1. Facebook Sharing Debugger
Test and validate Open Graph tags:
- URL: https://developers.facebook.com/tools/debug/
- Enter your page URL (e.g., `https://greenwoodscity.in/news/your-slug`)
- Click "Debug" to see how Facebook will display your content
- Click "Scrape Again" if you've updated the meta tags

### 2. Twitter Card Validator
Test Twitter card rendering:
- URL: https://cards-dev.twitter.com/validator
- Enter your page URL
- Preview how the card will appear on Twitter

### 3. LinkedIn Post Inspector
Test LinkedIn sharing:
- URL: https://www.linkedin.com/post-inspector/
- Enter your page URL
- See how LinkedIn will display the shared link

### 4. WhatsApp Share
Test by sharing the URL directly in WhatsApp:
- The preview will show after a few seconds
- Image, title, and description should appear

### 5. Manual Testing
Share your page URL on:
- Facebook
- Twitter
- LinkedIn
- WhatsApp
- Telegram
- Reddit

## Recommended Image Specifications

For optimal social media display:

### Image Dimensions
- **Recommended**: 1200 x 630 pixels
- **Minimum**: 600 x 315 pixels
- **Aspect Ratio**: 1.91:1

### File Size
- **Maximum**: 8 MB (for most platforms)
- **Recommended**: < 1 MB for faster loading

### File Formats
- JPEG
- PNG
- WebP (supported by most platforms)

## Troubleshooting

### Image Not Showing
1. **Check Image URL**: Ensure the image URL is accessible publicly
2. **Absolute URL**: Make sure the image URL is absolute (not relative)
3. **HTTPS**: Use HTTPS URLs (some platforms reject HTTP)
4. **File Size**: Ensure image is < 8 MB
5. **Clear Cache**: Use Facebook Debugger to scrape again

### Wrong Preview Showing
1. **Clear Platform Cache**: 
   - Facebook: Use Sharing Debugger and click "Scrape Again"
   - LinkedIn: Use Post Inspector
   - Twitter: Cards are cached for ~7 days
2. **Verify Meta Tags**: View page source and check `<meta>` tags
3. **Check URL**: Ensure you're testing the correct URL

### Description Truncated
- Some platforms limit description length
- Facebook: ~300 characters
- Twitter: ~200 characters
- Keep descriptions concise and meaningful

## Code Examples

### News Page Meta Tags
```typescript
{
  title: "News Title - Greenwood City",
  description: "Short description",
  openGraph: {
    title: "News Title",
    description: "Short description",
    url: "https://greenwoodscity.in/news/slug",
    siteName: "Greenwood City Block C",
    images: [{ url: "https://...", width: 1200, height: 630 }],
    type: "article",
    publishedTime: "2024-01-01T00:00:00Z"
  },
  twitter: {
    card: "summary_large_image",
    title: "News Title",
    description: "Short description",
    images: ["https://..."]
  }
}
```

## Best Practices

1. **Always Provide Images**: Content with images gets 2-3x more engagement
2. **Write Compelling Descriptions**: Keep it under 200 characters
3. **Test Before Publishing**: Use validation tools before sharing
4. **Use High-Quality Images**: Clear, relevant images perform better
5. **Update Regularly**: Keep meta tags in sync with content updates

## Platform-Specific Notes

### Facebook
- Caches aggressively - use Sharing Debugger to refresh
- Minimum image size: 200 x 200 pixels
- Recommended: 1200 x 630 pixels

### Twitter
- Supports multiple card types
- Using `summary_large_image` for best display
- Image appears above text

### LinkedIn
- Similar to Facebook OG tags
- Minimum image size: 1200 x 627 pixels
- PNG images often work better

### WhatsApp
- Uses Open Graph tags
- Preview loads after URL is sent
- Limited customization options

## Future Enhancements

Potential improvements:
1. **Dynamic OG Images**: Generate images with overlaid text
2. **Multiple Images**: Provide image gallery for richer previews
3. **Video Support**: Add OG video tags for video content
4. **Localization**: Support multiple languages
5. **Analytics**: Track social media referrals

## Resources

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/best-practices)
- [LinkedIn Share URL Documentation](https://www.linkedin.com/help/linkedin/answer/46687)

---

**Last Updated**: January 1, 2026
**Implemented By**: AI Assistant
**Status**: ✅ Implemented and Ready for Testing

