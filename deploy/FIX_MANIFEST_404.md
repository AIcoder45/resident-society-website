# Fix: manifest.json 404 Error

## Problem
- `GET /manifest.json` returns `404 Not Found`
- PWA installation fails
- Browser can't find the web app manifest

## Root Cause
The `manifest.ts` file in Next.js App Router generates the `/manifest.json` route dynamically. If:
1. The app hasn't been rebuilt after adding/updating `manifest.ts`
2. The manifest function throws an error (e.g., Strapi connection failure)
3. The Next.js server isn't running properly

Then the route won't be available.

## Solution

### Step 1: Update Code (Already Fixed)
The `src/app/manifest.ts` file has been updated with error handling to ensure it always returns valid data, even if Strapi is unavailable.

### Step 2: Rebuild and Restart on Server

SSH into your VPS and run:

```bash
cd /var/www/greenwood-city

# Pull latest changes (if using git)
git pull origin main

# Stop PM2 process
pm2 stop greenwood-city

# Clean build artifacts
rm -rf .next
rm -rf node_modules/.cache

# Rebuild the application
npm run build

# Restart PM2 with updated environment
pm2 restart greenwood-city --update-env
pm2 save

# Check logs for any errors
pm2 logs greenwood-city --lines 50
```

### Step 3: Verify Manifest is Working

Test the manifest endpoint:

```bash
# Test locally on server
curl -I http://localhost:3000/manifest.json

# Should return: HTTP/1.1 200 OK
# Content-Type: application/json

# Test via domain
curl -I https://greenwoodscity.in/manifest.json
```

### Step 4: Check Browser

1. Open `https://greenwoodscity.in/manifest.json` in your browser
2. You should see JSON content, not a 404 error
3. Verify the manifest includes:
   - `name`
   - `short_name`
   - `icons`
   - `start_url`
   - `display: "standalone"`

## Quick Fix Command (One-liner)

```bash
cd /var/www/greenwood-city && pm2 stop greenwood-city && rm -rf .next node_modules/.cache && npm run build && pm2 restart greenwood-city --update-env && pm2 save && curl -I http://localhost:3000/manifest.json
```

## Troubleshooting

### If manifest still returns 404:

1. **Check if Next.js is running:**
   ```bash
   pm2 status
   curl http://localhost:3000
   ```

2. **Check PM2 logs for errors:**
   ```bash
   pm2 logs greenwood-city --err --lines 100
   ```

3. **Verify manifest.ts file exists:**
   ```bash
   ls -la /var/www/greenwood-city/src/app/manifest.ts
   ```

4. **Check build output:**
   ```bash
   ls -la /var/www/greenwood-city/.next/server/app/manifest/
   ```

5. **Test manifest function directly:**
   ```bash
   cd /var/www/greenwood-city
   node -e "require('./.next/server/app/manifest/route.js')"
   ```

### If Strapi connection fails:

The manifest will still work with fallback values. Check logs:

```bash
pm2 logs greenwood-city | grep -i manifest
```

You should see:
```
[Manifest] Failed to fetch theme data: [error details]
```

This is expected if Strapi is unavailable - the manifest will use default values.

### If Nginx is blocking the route:

Check Nginx configuration:

```bash
nginx -t
cat /etc/nginx/sites-available/greenwood-city
```

Ensure all routes are proxied to Next.js:

```nginx
location / {
    proxy_pass http://localhost:3000;
    # ... other proxy settings
}
```

## Prevention

### Add to Deployment Script

Update your deployment script to always rebuild:

```bash
#!/bin/bash
cd /var/www/greenwood-city
pm2 stop greenwood-city
rm -rf .next node_modules/.cache
npm run build
pm2 restart greenwood-city --update-env
pm2 save
```

### Monitor Manifest Route

Add health check:

```bash
# Add to cron or monitoring
curl -f https://greenwoodscity.in/manifest.json || echo "Manifest check failed"
```

## Expected Manifest Structure

After fix, `/manifest.json` should return:

```json
{
  "name": "Greenwood City Block C",
  "short_name": "Block C",
  "description": "Stay connected with Greenwood City Block C...",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F0FFF4",
  "theme_color": "#2F855A",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/logo.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/logo.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ],
  "categories": ["lifestyle", "social"]
}
```

