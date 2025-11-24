# Immediate Fix Guide - Current Issues

Based on your logs, here are the **two main issues** and how to fix them:

---

## Issue 1: Strapi 502 Bad Gateway Error ❌

**Error in logs:**
```
❌ [Strapi] Fetch Error: {
  error: 'Strapi API error: 502 Bad Gateway',
  url: 'https://admin.greenwoodscity.in/api/events?populate=*&sort[0]=eventDate:asc&pagination[pageSize]=100',
  ...
}
```

**What this means:** Your Next.js app can't connect to Strapi because Strapi is not running or not accessible.

### Quick Fix Steps:

**Step 1: Connect to your Strapi server** (where Strapi is hosted)
```bash
ssh root@your-strapi-server-ip
```

**Step 2: Check if Strapi is running**
```bash
pm2 status
```

**Step 3: If Strapi is not running, start it**
```bash
cd /path/to/strapi
pm2 start ecosystem.config.js
# or
pm2 start npm --name strapi -- start
pm2 save
```

**Step 4: Test Strapi locally**
```bash
curl http://localhost:1337/api/events
```

**Step 5: Test Strapi via domain**
```bash
curl https://admin.greenwoodscity.in/api/events
```

**If Step 4 works but Step 5 doesn't:** Check Nginx configuration on Strapi server.

**Full guide:** See `deploy/FIX_502_STRAPI_ERROR.md`

---

## Issue 2: Missing Gallery Images ❌

**Error in logs:**
```
⨯ The requested resource isn't a valid image for /images/gallery/festival-1.jpg received null
⨯ The requested resource isn't a valid image for /images/gallery/garden-1.jpg received null
⨯ The requested resource isn't a valid image for /images/gallery/new-year-3.jpg received null
```

**What this means:** The gallery JSON references images that don't exist in the `public/images/gallery/` directory.

### Quick Fix Steps:

**Option A: Add the missing images** (Recommended)

**Step 1: On your VPS, check what's missing**
```bash
cd /var/www/greenwood-city
./deploy/diagnose-issues.sh
```

**Step 2: Create gallery directory if it doesn't exist**
```bash
mkdir -p public/images/gallery
chown -R www-data:www-data public/images/gallery
```

**Step 3: Upload your gallery images**
```bash
# From your local machine
scp public/images/gallery/*.jpg root@31.97.232.51:/var/www/greenwood-city/public/images/gallery/
```

**Step 4: Set permissions**
```bash
# On VPS
chmod -R 644 /var/www/greenwood-city/public/images/gallery/*.jpg
```

**Step 5: Restart app**
```bash
pm2 restart greenwood-city
```

**Option B: Temporarily remove gallery items** (Quick workaround)

```bash
# On VPS
cd /var/www/greenwood-city
nano src/data/gallery.json

# Empty the array or remove items with missing images
# Save and rebuild
npm run build
pm2 restart greenwood-city
```

**Full guide:** See `deploy/FIX_MISSING_GALLERY_IMAGES.md`

---

## Quick Diagnostic Script

**Run this on your VPS to check everything:**

```bash
cd /var/www/greenwood-city
chmod +x deploy/diagnose-issues.sh
./deploy/diagnose-issues.sh
```

This script will:
- ✅ Check application status
- ✅ Test Strapi connection
- ✅ List missing images
- ✅ Check system resources
- ✅ Show recent errors

---

## Priority Actions

### 🔴 High Priority (Do First)

1. **Fix Strapi 502 Error**
   - Check if Strapi server is running
   - Start Strapi if it's down
   - Verify Strapi responds to requests

2. **Fix Missing Images**
   - Add missing gallery images OR
   - Update gallery.json to remove missing images

### 🟡 Medium Priority

3. **Verify everything works**
   - Run diagnostic script
   - Check logs for new errors
   - Test website functionality

### 🟢 Low Priority

4. **Optimize and prevent**
   - Set up monitoring for Strapi
   - Add image validation before deployment
   - Document image requirements

---

## Expected Outcome

After fixing both issues:

✅ **Strapi errors disappear** - App connects to Strapi successfully  
✅ **Image errors disappear** - Gallery images load correctly  
✅ **Website works normally** - All features functional

---

## Still Having Issues?

1. **Run the diagnostic script:**
   ```bash
   ./deploy/diagnose-issues.sh
   ```

2. **Check detailed logs:**
   ```bash
   pm2 logs greenwood-city --lines 200
   ```

3. **Review guides:**
   - `deploy/FIX_502_STRAPI_ERROR.md` - Strapi troubleshooting
   - `deploy/FIX_MISSING_GALLERY_IMAGES.md` - Image fixes
   - `deploy/CHECK_LOGS_GUIDE.md` - Complete log guide

4. **Check system resources:**
   ```bash
   free -h
   df -h
   pm2 monit
   ```

---

## Quick Commands Reference

```bash
# View logs
pm2 logs greenwood-city --lines 100

# View errors only
pm2 logs greenwood-city --err --lines 100

# Restart app
pm2 restart greenwood-city

# Check status
pm2 status

# Run diagnostic
./deploy/diagnose-issues.sh
```

---

**Start with the diagnostic script to see exactly what needs fixing!**

