# Fix Production Issues - https://greenwoodscity.in/

## Issues Found

After checking https://greenwoodscity.in/, the following issues were identified:

### 1. ❌ Image Loading Errors (400 Bad Request)
**Problem**: All news images are failing to load with 400 errors:
- `/images/news/agm.jpg`
- `/images/news/playground.jpg`
- `/images/news/cleaning.jpg`
- `/images/news/security.jpg`
- `/images/news/solar.jpg`

**Root Cause**: 
- The app is using JSON fallback (Strapi not connected)
- JSON files reference images in `/public/images/news/` folder
- The folder exists but is **empty** - images don't exist
- Next.js Image optimization is failing on these relative paths

### 2. ❌ Missing PWA Icons (404 Not Found)
**Problem**: 
- `/icon-192.png` - Missing
- `/icon-512.png` - Missing (referenced in manifest but not checked)

**Root Cause**: 
- Manifest references these icons but files don't exist in `/public/` folder
- PWA installation will fail without these icons

### 3. ❌ Missing Favicon (404 Not Found)
**Problem**: `/favicon.ico` is missing

**Root Cause**: No favicon file exists in `/public/` folder

### 4. ⚠️ Strapi Not Connected
**Problem**: App is using JSON fallback instead of Strapi CMS

**Root Cause**: 
- `STRAPI_URL` environment variable not set in production
- See `FIX_STRAPI_PRODUCTION.md` for solution

### 5. ⚠️ Deprecated Meta Tag
**Problem**: Using deprecated `apple-mobile-web-app-capable` meta tag

**Root Cause**: Should use `mobile-web-app-capable` instead

---

## Solutions

### Solution 1: Fix Image Loading (Choose One Option)

#### Option A: Connect Strapi (Recommended)
If you want to use Strapi CMS:

1. **Set up Strapi connection** (see `FIX_STRAPI_PRODUCTION.md`):
   ```bash
   # On VPS server
   cd /var/www/greenwood-city
   
   # Add to .env.production or ecosystem.config.js
   STRAPI_URL=https://admin.greenwoodscity.in
   ```

2. **Restart PM2**:
   ```bash
   pm2 restart greenwood-city --update-env
   ```

3. **Verify Strapi is connected**:
   ```bash
   pm2 logs greenwood-city | grep -i strapi
   ```

#### Option B: Add Missing Images to Public Folder
If you want to keep using JSON fallback:

1. **Upload images to server**:
   ```bash
   # On VPS server
   cd /var/www/greenwood-city/public/images/news
   
   # Upload these images:
   # - agm.jpg
   # - playground.jpg
   # - cleaning.jpg
   # - security.jpg
   # - solar.jpg
   ```

2. **Or create placeholder images**:
   ```bash
   # Create simple placeholder images using ImageMagick or similar
   cd /var/www/greenwood-city/public/images/news
   # Create 5 placeholder images with appropriate names
   ```

#### Option C: Fix Image Path Handling
Update the code to handle missing images gracefully:

**File**: `src/components/shared/ContentCard.tsx`

```typescript
// Add error handling for missing images
{image && (
  <div className="relative w-full h-52 sm:h-48 overflow-hidden rounded-t-lg bg-gray-200">
    <Image
      src={image}
      alt={title}
      fill
      className="object-cover transition-transform duration-300 hover:scale-105"
      sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      loading="lazy"
      unoptimized={image.startsWith("/") && !image.startsWith("http")}
      onError={(e) => {
        // Hide image on error or show placeholder
        e.currentTarget.style.display = 'none';
      }}
    />
  </div>
)}
```

---

### Solution 2: Add Missing PWA Icons

1. **Create icon files** (192x192 and 512x512 PNG):
   ```bash
   # On your local machine or server
   # Create icon-192.png and icon-512.png
   # Use a logo or create simple icons
   ```

2. **Upload to public folder**:
   ```bash
   # On VPS server
   cd /var/www/greenwood-city/public
   
   # Upload:
   # - icon-192.png (192x192 pixels)
   # - icon-512.png (512x512 pixels)
   ```

3. **Or generate from existing logo**:
   ```bash
   # If you have a logo, resize it:
   # Using ImageMagick:
   convert logo.png -resize 192x192 icon-192.png
   convert logo.png -resize 512x512 icon-512.png
   ```

---

### Solution 3: Add Missing Favicon

1. **Create favicon.ico**:
   ```bash
   # Create a 32x32 or 16x16 favicon
   # Convert PNG to ICO format
   ```

2. **Upload to public folder**:
   ```bash
   # On VPS server
   cd /var/www/greenwood-city/public
   
   # Upload favicon.ico
   ```

3. **Or use online favicon generator**:
   - Upload your logo to https://realfavicongenerator.net/
   - Download generated favicon.ico
   - Upload to `/public/` folder

---

### Solution 4: Fix Deprecated Meta Tag

**File**: `src/app/layout.tsx` (or wherever meta tags are defined)

**Find**:
```tsx
<meta name="apple-mobile-web-app-capable" content="yes" />
```

**Replace with**:
```tsx
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" /> {/* Keep for iOS compatibility */}
```

---

## Quick Fix Commands (Run on VPS)

```bash
# SSH into VPS
ssh root@31.97.232.51

# Navigate to app directory
cd /var/www/greenwood-city

# 1. Check if Strapi is connected
pm2 env 0 | grep STRAPI_URL

# 2. If not connected, add to .env.production
echo "STRAPI_URL=https://admin.greenwoodscity.in" >> .env.production

# 3. Restart PM2
pm2 restart greenwood-city --update-env

# 4. Check logs
pm2 logs greenwood-city --lines 50

# 5. Verify images folder exists
ls -la public/images/news/

# 6. If using JSON fallback, upload images to public/images/news/
# (You'll need to upload: agm.jpg, playground.jpg, cleaning.jpg, security.jpg, solar.jpg)

# 7. Create/upload PWA icons
# Upload icon-192.png and icon-512.png to public/

# 8. Create/upload favicon
# Upload favicon.ico to public/

# 9. Rebuild if needed
npm run build
pm2 restart greenwood-city
```

---

## Priority Order

1. **HIGH**: Connect Strapi (Solution 1A) - This will fix images if Strapi has images uploaded
2. **HIGH**: Add missing images (Solution 1B) - If not using Strapi
3. **MEDIUM**: Add PWA icons (Solution 2) - For PWA functionality
4. **MEDIUM**: Add favicon (Solution 3) - For better UX
5. **LOW**: Fix deprecated meta tag (Solution 4) - Minor issue

---

## Verification

After applying fixes, check:

1. **Images load correctly**:
   ```bash
   curl -I https://greenwoodscity.in/images/news/agm.jpg
   # Should return 200 OK
   ```

2. **Icons exist**:
   ```bash
   curl -I https://greenwoodscity.in/icon-192.png
   curl -I https://greenwoodscity.in/icon-512.png
   # Should return 200 OK
   ```

3. **Favicon exists**:
   ```bash
   curl -I https://greenwoodscity.in/favicon.ico
   # Should return 200 OK
   ```

4. **Browser console**: No 400/404 errors for images and icons

5. **Strapi connection**: Check PM2 logs for Strapi API calls

---

## Related Files

- `deploy/FIX_STRAPI_PRODUCTION.md` - Strapi connection setup
- `src/components/shared/ContentCard.tsx` - Image component
- `src/lib/api.ts` - API functions (Strapi/JSON fallback)
- `public/manifest.json` - PWA manifest
- `src/app/manifest.ts` - Dynamic manifest generation
- `src/data/news.json` - JSON fallback data

