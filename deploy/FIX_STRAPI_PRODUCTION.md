# Fix Strapi Connection in Production

## Problem
The Next.js app deployed on VPS is not connecting to Strapi, causing:
1. All content falling back to JSON files
2. Images showing 400 errors because they're relative paths from JSON fallback

## Root Cause
The PM2 ecosystem configuration doesn't include `STRAPI_URL` environment variable, so the app can't find Strapi.

## Quick Commands to Ensure Production Environment Variables Are Loaded

```bash
# Quick verification (run this first)
cd /var/www/greenwood-city
pm2 env 0 | grep STRAPI_URL || echo "❌ STRAPI_URL not found"

# Force reload environment variables
pm2 restart greenwood-city --update-env

# Or completely restart to ensure .env.production is loaded
pm2 delete greenwood-city
NODE_ENV=production pm2 start ecosystem.config.js
pm2 save

# Verify .env.production file exists and is readable
cat .env.production | grep STRAPI_URL
```

## Solution

### Step 1: Update PM2 Configuration

On your VPS server, update the PM2 ecosystem config:

```bash
# SSH into your VPS
ssh root@31.97.232.51

# Navigate to app directory
cd /var/www/greenwood-city

# Edit ecosystem.config.js
nano ecosystem.config.js
```

Update the `env` section to include:

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  STRAPI_URL: 'https://admin.greenwoodscity.in',
  STRAPI_API_TOKEN: 'd3b1c47723bbfc0bfdf5c5b61e77af81d53a2c7b8619d3614b6f0c1cabc25b487aaf7ce0a07d0a0e0e7eac7ae7792fd4f23235df124728c64a50d433e96eb7426b369c611a6c9ff5d25c39d837b6e1466b8f2705153e495d230151b7f2e975f514eb4abae8d7b44a8096edbdaad6f0d258d5f5028b23cb6b998f3e256e6520d2'  // Optional, if needed
}
```

### Step 2: Restart PM2 with Updated Config

```bash
# Stop the current app
pm2 stop greenwood-city

# Delete the old process
pm2 delete greenwood-city

# Start with updated config
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
```

### Step 3: Verify Environment Variables Are Loaded

**Comprehensive commands to ensure production environment variables are loaded:**

```bash
# Navigate to app directory
cd /var/www/greenwood-city

# Method 1: Check PM2 environment variables directly
pm2 env 0  # Shows all env vars for process ID 0 (or use: pm2 show greenwood-city | grep env)

# Method 2: Check if .env.production file exists and is readable
ls -la .env.production
cat .env.production  # View contents (be careful with secrets)

# Method 3: Verify PM2 process environment
pm2 show greenwood-city | grep -A 20 "env:"

# Method 4: Check environment variables in running process
pm2 describe greenwood-city | grep -E "(STRAPI_URL|NODE_ENV|PORT)"

# Method 5: Test environment variable loading by checking PM2 logs
pm2 logs greenwood-city --lines 50 --nostream

# Method 6: Restart PM2 to ensure .env.production is loaded
pm2 restart greenwood-city --update-env

# Method 7: Verify environment variables are accessible (if using .env.production)
# This ensures Next.js loads the file
NODE_ENV=production node -e "require('dotenv').config({ path: '.env.production' }); console.log('STRAPI_URL:', process.env.STRAPI_URL)"

# Method 8: Check PM2 ecosystem config is correct
cat ecosystem.config.js | grep -A 10 "env:"

# Method 9: Force reload environment variables
pm2 delete greenwood-city
pm2 start ecosystem.config.js
pm2 save

# Method 10: Verify in application logs (should show env vars if debug logging enabled)
pm2 logs greenwood-city --lines 100 | grep -i "strapi\|env"
```

**Expected Output:**

When environment variables are loaded correctly, you should see:
- `STRAPI_URL=https://admin.greenwoodscity.in` in PM2 env output
- `NODE_ENV=production` in PM2 env output
- Application logs showing Strapi connection attempts
- No errors about missing environment variables

**Quick Verification Command:**

```bash
# One-liner to check if STRAPI_URL is set in PM2
pm2 env 0 | grep STRAPI_URL || echo "❌ STRAPI_URL not found in PM2 environment"
```

### Step 4: Alternative - Use .env.production File

If you prefer using `.env.production` file instead of PM2 config:

```bash
# Create .env.production file
cd /var/www/greenwood-city
nano .env.production
```

Add:
```env
NODE_ENV=production
PORT=3000
STRAPI_URL=https://admin.greenwoodscity.in
STRAPI_API_TOKEN=your-strapi-api-token-here
```

Then restart PM2:
```bash
pm2 restart greenwood-city
```

### Step 5: Ensure Production Environment Variables Are Loaded

**Important:** Next.js loads `.env.production` automatically when `NODE_ENV=production`. To ensure it's loaded:

```bash
cd /var/www/greenwood-city

# Option 1: Rebuild Next.js app (ensures env vars are loaded at build time)
# This is important if you're using NEXT_PUBLIC_* variables
NODE_ENV=production npm run build
pm2 restart greenwood-city

# Option 2: Restart PM2 with explicit environment
pm2 restart greenwood-city --update-env

# Option 3: Delete and restart to force reload
pm2 delete greenwood-city
NODE_ENV=production pm2 start ecosystem.config.js
pm2 save

# Option 4: Verify .env.production is being read
# Check that Next.js can read the file
node -e "
require('dotenv').config({ path: '.env.production' });
console.log('✅ STRAPI_URL:', process.env.STRAPI_URL || '❌ NOT SET');
console.log('✅ NODE_ENV:', process.env.NODE_ENV || '❌ NOT SET');
"
```

**Note:** If you're using `.env.production` file:
- Next.js automatically loads it when `NODE_ENV=production`
- PM2 should set `NODE_ENV=production` in ecosystem.config.js
- Rebuild the app after changing `.env.production` to ensure changes take effect

## Verification

After applying the fix:

1. **Check logs**: `pm2 logs greenwood-city` should show Strapi being called
2. **Check browser console**: Should see Strapi URLs in network requests
3. **Check images**: Images should load from `https://admin.greenwoodscity.in/uploads/...`
4. **Check content**: Content should come from Strapi, not JSON fallback

## Troubleshooting

### If Strapi still not connecting:

1. **Check Strapi is accessible**:
   ```bash
   curl https://admin.greenwoodscity.in/api/news-articles
   ```

2. **Configure CORS settings** in Strapi:

   **Option A: Via Strapi Admin Panel (Recommended)**
   - Go to Strapi Admin → Settings → Security → CORS
   - Add the following origins to allowed origins:
     - `https://greenwoodscity.in`
     - `https://admin.greenwoodscity.in`
     - `https://www.greenwoodscity.in` (if using www subdomain)
   - Enable credentials if needed
   - Save the configuration

   **Option B: Via Strapi Middleware Configuration**
   - SSH into your Strapi server
   - Navigate to your Strapi project directory
   - Edit `config/middlewares.js`:
   ```javascript
   module.exports = [
     'strapi::logger',
     'strapi::errors',
     {
       name: 'strapi::security',
       config: {
         contentSecurityPolicy: {
           useDefaults: true,
           directives: {
             'connect-src': ["'self'", 'https:'],
             'img-src': ["'self'", 'data:', 'blob:', 'https://admin.greenwoodscity.in'],
             'media-src': ["'self'", 'data:', 'blob:', 'https://admin.greenwoodscity.in'],
             upgradeInsecureRequests: null,
           },
         },
       },
     },
     {
       name: 'strapi::cors',
       config: {
         enabled: true,
         origin: [
           'https://greenwoodscity.in',
           'https://admin.greenwoodscity.in',
           'https://www.greenwoodscity.in',
         ],
         credentials: true,
       },
     },
     'strapi::poweredBy',
     'strapi::query',
     'strapi::body',
     'strapi::session',
     'strapi::favicon',
     'strapi::public',
   ];
   ```
   - Restart Strapi after making changes

3. **Check Strapi API permissions**:
   - Go to Strapi Admin → Settings → Users & Permissions → Roles → Public
   - Ensure `find` and `findOne` are enabled for all content types

4. **Check PM2 environment**:
   ```bash
   pm2 env 0  # Shows environment for process ID 0
   ```

### If images still showing 400 errors:

1. **Verify images exist in Strapi**: Check Strapi admin panel
2. **Check image URLs**: Should be full URLs like `https://admin.greenwoodscity.in/uploads/...`
3. **Check Next.js image config**: Ensure `admin.greenwoodscity.in` is in `remotePatterns`

## Files Changed

1. `deploy/ecosystem.config.js` - Added STRAPI_URL to env
2. `next.config.mjs` - Added admin.greenwoodscity.in to image domains
3. `src/components/shared/ContentCard.tsx` - Added unoptimized prop for relative paths
4. `src/components/shared/EventCard.tsx` - Added unoptimized prop for relative paths

