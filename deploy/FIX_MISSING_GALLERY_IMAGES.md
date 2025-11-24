# Fix Missing Gallery Images

## Problem

Your application is showing errors for missing gallery images:

```
⨯ The requested resource isn't a valid image for /images/gallery/festival-1.jpg received null
⨯ The requested resource isn't a valid image for /images/gallery/garden-1.jpg received null
⨯ The requested resource isn't a valid image for /images/gallery/new-year-3.jpg received null
```

## Root Cause

The gallery JSON file (`src/data/gallery.json`) references images that don't exist in the `public/images/gallery/` directory.

---

## Solution Options

### Option 1: Add Missing Images (Recommended)

**Step 1: Check what images are referenced**

```bash
# On your local machine or VPS
cd /var/www/greenwood-city
grep -o '"/images/gallery/[^"]*"' src/data/gallery.json
```

**Step 2: Check what images actually exist**

```bash
# On VPS
ls -la /var/www/greenwood-city/public/images/gallery/

# Or check locally
ls -la public/images/gallery/
```

**Step 3: Add missing images**

You need to add these images to `public/images/gallery/`:
- `festival-1.jpg`
- `festival-2.jpg`
- `festival-3.jpg`
- `festival-4.jpg`
- `festival-5.jpg`
- `garden-1.jpg`
- `garden-2.jpg`
- `garden-3.jpg`
- `new-year-1.jpg`
- `new-year-2.jpg`
- `new-year-3.jpg`
- `new-year-4.jpg`
- `sports-1.jpg`
- `sports-2.jpg`
- `sports-3.jpg`
- `sports-4.jpg`

**Step 4: Upload images to VPS**

```bash
# From your local machine
scp public/images/gallery/*.jpg root@31.97.232.51:/var/www/greenwood-city/public/images/gallery/

# Or upload via SFTP/FTP client
```

**Step 5: Set correct permissions**

```bash
# On VPS
chown -R www-data:www-data /var/www/greenwood-city/public/images/
chmod -R 644 /var/www/greenwood-city/public/images/gallery/*.jpg
```

**Step 6: Restart application**

```bash
pm2 restart greenwood-city
```

---

### Option 2: Update Gallery JSON to Use Existing Images

**If you have different images, update the JSON file:**

```bash
# On VPS
cd /var/www/greenwood-city
nano src/data/gallery.json
```

**Update image paths to match files that actually exist:**

```json
{
  "id": "1",
  "title": "New Year Celebration 2024",
  "description": "Memorable moments from our New Year celebration",
  "images": [
    "/images/gallery/your-actual-image-1.jpg",
    "/images/gallery/your-actual-image-2.jpg"
  ],
  "eventId": null,
  "createdAt": "2024-01-01T20:00:00Z"
}
```

**Then rebuild and restart:**

```bash
npm run build
pm2 restart greenwood-city
```

---

### Option 3: Use Placeholder Images

**If you don't have images yet, use placeholder services:**

**Option A: Update JSON to use placeholder URLs**

```json
{
  "id": "1",
  "title": "New Year Celebration 2024",
  "images": [
    "https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=New+Year+1",
    "https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=New+Year+2"
  ]
}
```

**Option B: Create placeholder images locally**

```bash
# Create a simple placeholder image script
# Or use ImageMagick to create placeholders
convert -size 800x600 xc:#4F46E5 -pointsize 72 -fill white -gravity center -annotate +0+0 "Gallery Image" public/images/gallery/placeholder.jpg
```

---

### Option 4: Remove Gallery Items Temporarily

**If you want to hide gallery until images are ready:**

```bash
# On VPS
cd /var/www/greenwood-city
nano src/data/gallery.json
```

**Empty the array or comment out items:**

```json
[]
```

**Or remove specific items that have missing images.**

---

## Quick Fix Script

**Create a script to check and list missing images:**

```bash
#!/bin/bash
# check-missing-images.sh

echo "Checking for missing gallery images..."
echo ""

cd /var/www/greenwood-city

# Extract image paths from JSON
grep -o '"/images/gallery/[^"]*"' src/data/gallery.json | sed 's/"//g' | sort -u > /tmp/required-images.txt

# Check which images exist
missing=0
while IFS= read -r image; do
    if [ ! -f "public$image" ]; then
        echo "❌ Missing: public$image"
        missing=$((missing + 1))
    else
        echo "✅ Found: public$image"
    fi
done < /tmp/required-images.txt

echo ""
echo "Total missing: $missing"

# Cleanup
rm /tmp/required-images.txt
```

**Run it:**

```bash
chmod +x check-missing-images.sh
./check-missing-images.sh
```

---

## Verify Fix

**After adding images:**

```bash
# On VPS
cd /var/www/greenwood-city

# Check images exist
ls -lh public/images/gallery/*.jpg

# Test image URLs
curl -I http://localhost:3000/images/gallery/festival-1.jpg

# Check logs for errors
pm2 logs greenwood-city --lines 50 | grep -i "image\|gallery"
```

---

## Best Practices

1. **Always verify images exist** before deploying
2. **Use consistent naming** (lowercase, hyphens)
3. **Optimize images** before uploading (compress, resize)
4. **Keep images organized** in proper directories
5. **Document image requirements** (size, format, naming)

---

## Image Optimization Tips

**Before uploading, optimize images:**

```bash
# Using ImageMagick (if installed)
for img in public/images/gallery/*.jpg; do
    convert "$img" -resize 1200x1200\> -quality 85 "$img"
done

# Or use online tools like:
# - TinyPNG
# - Squoosh
# - ImageOptim
```

**Recommended image specs:**
- Format: JPG or WebP
- Max width: 1200px
- Max height: 1200px
- Quality: 85%
- File size: < 500KB per image

---

## Summary

1. **Identify missing images** from error logs
2. **Add images** to `public/images/gallery/`
3. **Set correct permissions**
4. **Restart application**
5. **Verify** images load correctly

**The errors will disappear once the images are in place!**

