# Fix Chunk Load Errors and React Hydration Errors

## Problem
- `ChunkLoadError: Loading chunk failed` - Browser trying to load old chunks
- `React error #423` - Hydration mismatch error
- `400 Bad Request` - Static asset loading issues

## Root Causes
1. **Stale build artifacts** - Old chunks cached while new build deployed
2. **Browser cache** - Browser caching old JavaScript chunks
3. **Build mismatch** - Server and client have different build versions
4. **Service Worker cache** - PWA service worker caching old assets

## Solution Steps

### Step 1: Clean Build on Server

SSH into your VPS and run:

```bash
cd /var/www/greenwood-city

# Stop PM2 process
pm2 stop greenwood-city

# Remove all build artifacts
rm -rf .next
rm -rf node_modules/.cache
rm -rf out

# Clear npm cache
npm cache clean --force

# Reinstall dependencies (ensures clean state)
rm -rf node_modules
npm install

# Rebuild the application
npm run build

# Restart PM2
pm2 restart greenwood-city --update-env
pm2 save
```

### Step 2: Update Next.js Config

The `next.config.mjs` has been updated with:
- Better chunk handling
- Proper cache headers
- Build optimization

### Step 3: Clear Browser Cache

**For Users:**
1. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Clear browser cache completely
3. Disable service worker (if PWA installed):
   - Chrome: DevTools → Application → Service Workers → Unregister
   - Firefox: DevTools → Application → Service Workers → Unregister

**For Developers:**
```javascript
// In browser console:
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
  }
});
```

### Step 4: Update Service Worker

The service worker needs to be updated to handle cache invalidation:

1. **Update service worker version** in `public/sw.js`
2. **Force service worker update** by changing the version number
3. **Clear service worker cache** on next load

### Step 5: Verify Build

After rebuilding, verify:

```bash
# Check build output
ls -la .next/static/chunks/

# Check PM2 logs
pm2 logs greenwood-city --lines 50

# Test the site
curl -I https://greenwoodscity.in
```

## Prevention

### Add to Deployment Script

Update your deployment script to always clean before building:

```bash
#!/bin/bash
set -e

cd /var/www/greenwood-city

# Clean everything
rm -rf .next node_modules/.cache out

# Build
npm run build

# Restart
pm2 restart greenwood-city --update-env
```

### Monitor Build Version

Add build version tracking to detect mismatches:

```typescript
// In layout.tsx or a config file
export const BUILD_VERSION = process.env.BUILD_VERSION || Date.now().toString();
```

## Quick Fix Command (One-liner)

```bash
cd /var/www/greenwood-city && pm2 stop greenwood-city && rm -rf .next node_modules/.cache out && npm run build && pm2 restart greenwood-city --update-env && pm2 save
```

## If Issues Persist

1. **Check Nginx cache** (if using):
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

2. **Check PM2 logs**:
   ```bash
   pm2 logs greenwood-city --err
   ```

3. **Verify environment variables**:
   ```bash
   pm2 env 0
   ```

4. **Check disk space**:
   ```bash
   df -h
   ```

5. **Verify Node.js version**:
   ```bash
   node --version
   # Should be 18.x or 20.x
   ```

## React Error #423 Details

This is a hydration mismatch error. Common causes:

1. **Date/Time rendering** - Server and client render different times
2. **Random values** - Using Math.random() or Date.now() in render
3. **Browser-only APIs** - Accessing window/document during SSR
4. **Conditional rendering** - Different conditions on server vs client

**Fix**: Ensure all components that use browser APIs are wrapped in:
```typescript
if (typeof window === 'undefined') return null;
```

Or use:
```typescript
useEffect(() => {
  // Browser-only code
}, []);
```

