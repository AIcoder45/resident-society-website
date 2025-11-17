# PWA (Progressive Web App) Setup Guide

This guide explains the PWA implementation for the Greenwood City Block C website.

## ✅ What's Already Implemented

### 1. Web App Manifest (`src/app/manifest.ts`)
- ✅ Dynamically generated from Strapi Theme API
- ✅ Includes app name, icons, colors, and display settings
- ✅ Uses theme data for branding

### 2. Service Worker (`public/sw.js`)
- ✅ Caches essential pages for offline access
- ✅ Network-first strategy with cache fallback
- ✅ Automatic cache cleanup on updates

### 3. Service Worker Registration (`src/components/shared/ServiceWorkerRegistration.tsx`)
- ✅ Automatically registers service worker on page load
- ✅ Only runs in production mode
- ✅ Handles updates gracefully

### 4. Install Prompt (`src/components/shared/PWAInstallPrompt.tsx`)
- ✅ Shows install prompt on mobile devices
- ✅ Appears after 3 seconds (non-intrusive)
- ✅ Can be dismissed and won't show again in same session
- ✅ Only shows on mobile (hidden on desktop)

### 5. PWA Metadata
- ✅ Viewport configuration (`src/app/viewport.ts`)
- ✅ Theme color meta tags
- ✅ Apple Web App meta tags for iOS

## 📱 How to Install

### On Mobile Devices:

**Android (Chrome/Edge):**
1. Visit the website
2. Look for "Add to Home Screen" prompt, or
3. Tap the menu (⋮) → "Add to Home Screen" or "Install App"

**iOS (Safari):**
1. Visit the website
2. Tap the Share button (square with arrow)
3. Select "Add to Home Screen"
4. Tap "Add"

**Desktop (Chrome/Edge):**
1. Visit the website
2. Look for install icon in address bar, or
3. Menu → "Install [App Name]"

## 🔧 PWA Features

### ✅ Offline Support
- Caches essential pages
- Works offline after first visit
- Shows cached content when offline

### ✅ App-like Experience
- Standalone display (no browser UI)
- Full-screen experience
- Custom app icon and splash screen

### ✅ Fast Loading
- Service worker caches assets
- Faster repeat visits
- Background updates

### ✅ Mobile Optimized
- Touch-friendly interface
- Responsive design
- Bottom navigation for mobile

## 🎨 Customization

### Icons
Icons are automatically generated from:
1. **Favicon** from Strapi Theme API (preferred)
2. **Logo** from Strapi Theme API (fallback)

**Recommended icon sizes:**
- 192x192px (required)
- 512x512px (required, maskable)

### Colors
Colors come from Strapi Theme API:
- `themeColor`: Browser theme color
- `backgroundColor`: Splash screen background

### App Name
- `siteName`: Full name (e.g., "Greenwood City Block C")
- `siteShortName`: Short name (e.g., "Block C")

## 🚀 Testing PWA

### Development Mode
Service worker is **disabled** in development mode to avoid caching issues.

### Production Mode
1. Build the project: `npm run build`
2. Start production server: `npm run start`
3. Visit `http://localhost:3000`
4. Open Chrome DevTools → Application tab
5. Check:
   - Service Worker status
   - Manifest configuration
   - Cache storage

### Testing Installation
1. Use Chrome DevTools → Application → Manifest
2. Check "Add to homescreen" prompt
3. Test on actual mobile device (recommended)

## 📋 PWA Requirements Checklist

- ✅ HTTPS (required for production)
- ✅ Web App Manifest
- ✅ Service Worker
- ✅ Icons (192x192 and 512x512)
- ✅ Responsive design
- ✅ Offline support
- ✅ Install prompt

## 🔍 Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure running in production mode
- Verify `/sw.js` is accessible
- Check service worker scope

### Install Prompt Not Showing
- Must be served over HTTPS (or localhost)
- Must have valid manifest
- Must have service worker
- User must visit site multiple times (some browsers)
- Check browser support (Chrome, Edge, Safari iOS)

### App Not Installing
- Check manifest has valid icons
- Verify all required fields in manifest
- Check browser console for errors
- Try on different device/browser

## 📝 Notes

- Service worker only runs in **production** mode
- Install prompt appears after 3 seconds to avoid interrupting initial load
- Dismissed prompts won't show again in the same session
- Icons from Strapi Theme API are automatically used
- All PWA settings can be managed via Strapi CMS

## 🔗 Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Next.js PWA Guide](https://nextjs.org/docs/app/building-your-application/optimizing/progressive-web-apps)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

