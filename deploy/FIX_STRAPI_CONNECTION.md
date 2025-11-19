# Fix Strapi Connection Between Next.js and Strapi

## Current Setup
- **Next.js App**: `https://greenwoodscity.in`
- **Strapi Admin**: `https://admin.greenwoodscity.in/admin`
- **Strapi API**: `https://admin.greenwoodscity.in/api/...`

## Issue
Strapi URL is loaded in environment variables, but Next.js app cannot connect to Strapi API.

---

## Step 1: Verify STRAPI_URL Format

**IMPORTANT**: The `STRAPI_URL` should **NOT** include `/admin` or `/api`

### ✅ Correct Format:
```env
STRAPI_URL=https://admin.greenwoodscity.in
```

### ❌ Wrong Formats:
```env
STRAPI_URL=https://admin.greenwoodscity.in/admin  # WRONG - don't include /admin
STRAPI_URL=https://admin.greenwoodscity.in/api    # WRONG - don't include /api
```

The code automatically appends `/api/` to the base URL when making requests.

---

## Step 2: Verify .env.production File

On your VPS server:

```bash
# SSH into VPS
ssh root@31.97.232.51

# Navigate to app directory
cd /var/www/greenwood-city

# Check .env.production file
cat .env.production | grep STRAPI_URL

# Should show:
# STRAPI_URL=https://admin.greenwoodscity.in
```

If it shows `/admin` at the end, fix it:

```bash
# Edit the file
nano .env.production

# Remove /admin from STRAPI_URL
# Change: STRAPI_URL=https://admin.greenwoodscity.in/admin
# To:     STRAPI_URL=https://admin.greenwoodscity.in

# Save and exit (Ctrl+X, Y, Enter)
```

---

## Step 3: Verify Strapi API is Accessible

Test if Strapi API is accessible from the server:

```bash
# Test API endpoint
curl https://admin.greenwoodscity.in/api/news-articles

# Should return JSON data or at least not a 404/403 error
# If you get CORS error, that's expected from curl, but check the response
```

If you get 404, check:
- Strapi is running
- API endpoint name matches (should be `news-articles` not `news`)
- Strapi permissions are set correctly

---

## Step 4: Configure CORS in Strapi

**This is CRITICAL** - Strapi must allow requests from `https://greenwoodscity.in`

### Option A: Via Strapi Admin Panel (Recommended)

1. **Login to Strapi Admin**: `https://admin.greenwoodscity.in/admin`
2. **Go to**: Settings → Security → CORS
3. **Add to allowed origins**:
   - `https://greenwoodscity.in`
   - `https://www.greenwoodscity.in` (if using www)
   - `http://localhost:3000` (for local testing)
4. **Enable credentials**: Check the box if needed
5. **Save**

### Option B: Via Strapi Middleware Configuration

On your Strapi server:

```bash
# SSH into Strapi server
# Navigate to Strapi project directory
cd /path/to/strapi-project

# Edit middleware configuration
nano config/middlewares.js
```

Update the CORS configuration:

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
          'img-src': ["'self'", 'data:', 'blob:', 'https://greenwoodscity.in'],
          'media-src': ["'self'", 'data:', 'blob:', 'https://greenwoodscity.in'],
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
        'https://www.greenwoodscity.in',
        'http://localhost:3000', // For local development
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

**Restart Strapi** after making changes:

```bash
# If using PM2
pm2 restart strapi

# Or if running directly
npm run start
```

---

## Step 5: Verify Strapi API Permissions

1. **Login to Strapi Admin**: `https://admin.greenwoodscity.in/admin`
2. **Go to**: Settings → Users & Permissions → Roles → Public
3. **Enable permissions** for all content types:
   - ✅ `news-articles` → `find`, `findOne`
   - ✅ `events` → `find`, `findOne`
   - ✅ `galleries` → `find`, `findOne`
   - ✅ `notifications` → `find`, `findOne`
   - ✅ `policies` → `find`, `findOne`
   - ✅ `homepage` → `find`
   - ✅ `theme` → `find`
   - ✅ `contacts` → `find`
   - ✅ `contact-infos` → `find`
   - ✅ `rwas` → `find`
   - ✅ `advertisements` → `find`
4. **Click Save**

---

## Step 6: Restart Next.js App with Updated Environment

After fixing `.env.production`:

```bash
# On VPS server
cd /var/www/greenwood-city

# Restart PM2 to load new environment variables
pm2 restart greenwood-city --update-env

# Verify environment variables are loaded
pm2 env 0 | grep STRAPI_URL

# Check logs for Strapi connection attempts
pm2 logs greenwood-city --lines 100 | grep -i strapi
```

---

## Step 7: Test Connection

### Test 1: Check PM2 Environment
```bash
pm2 env 0 | grep STRAPI_URL
# Should show: STRAPI_URL=https://admin.greenwoodscity.in
```

### Test 2: Check Application Logs
```bash
pm2 logs greenwood-city --lines 50
# Look for:
# - "Fetching news from Strapi: https://admin.greenwoodscity.in/api/..."
# - Any CORS errors
# - Any 404/403 errors
```

### Test 3: Test API Endpoint Directly
```bash
# From Next.js server, test Strapi API
curl -H "Origin: https://greenwoodscity.in" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://admin.greenwoodscity.in/api/news-articles

# Should return CORS headers if configured correctly
```

### Test 4: Check Browser Console
1. Visit `https://greenwoodscity.in`
2. Open browser DevTools (F12)
3. Check **Console** tab for errors
4. Check **Network** tab for failed requests to `admin.greenwoodscity.in`

Look for:
- CORS errors: `Access-Control-Allow-Origin`
- 404 errors: API endpoint not found
- 403 errors: Permission denied
- Network errors: Connection refused

---

## Step 8: Enable Debug Logging (Temporary)

To see what's happening, temporarily enable debug logging:

**File**: `src/lib/strapi.ts`

The code already has debug logging, but it only works in development mode. To see it in production:

```bash
# On VPS server
cd /var/www/greenwood-city

# Temporarily set NODE_ENV to development (for debugging only)
# Edit ecosystem.config.js or .env.production
# Change: NODE_ENV=production
# To:     NODE_ENV=development

# Restart PM2
pm2 restart greenwood-city

# Check logs
pm2 logs greenwood-city --lines 100

# Remember to change back to production after debugging!
```

---

## Common Issues and Solutions

### Issue 1: CORS Error in Browser Console
**Error**: `Access to fetch at 'https://admin.greenwoodscity.in/api/...' from origin 'https://greenwoodscity.in' has been blocked by CORS policy`

**Solution**: 
- Configure CORS in Strapi (Step 4)
- Ensure `https://greenwoodscity.in` is in allowed origins
- Restart Strapi after CORS changes

### Issue 2: 404 Not Found
**Error**: `404 Not Found` when calling Strapi API

**Solution**:
- Verify API endpoint name matches Strapi collection name
- Check Strapi is running: `curl https://admin.greenwoodscity.in/api/news-articles`
- Verify collection type is published in Strapi

### Issue 3: 403 Forbidden
**Error**: `403 Forbidden` when calling Strapi API

**Solution**:
- Check API permissions (Step 5)
- Ensure Public role has `find` and `findOne` permissions
- Verify content is published (not draft)

### Issue 4: Environment Variable Not Loading
**Error**: App still using JSON fallback

**Solution**:
- Verify `.env.production` exists and has correct format
- Check `STRAPI_URL` doesn't have trailing slash or `/admin`
- Restart PM2 with `--update-env` flag
- Rebuild Next.js app: `npm run build && pm2 restart greenwood-city`

### Issue 5: SSL Certificate Issues
**Error**: SSL/TLS errors when connecting

**Solution**:
- Verify SSL certificate is valid for `admin.greenwoodscity.in`
- Check certificate expiration
- Ensure HTTPS is properly configured

---

## Verification Checklist

- [ ] `.env.production` exists and `STRAPI_URL=https://admin.greenwoodscity.in` (no `/admin`)
- [ ] PM2 environment shows correct `STRAPI_URL`
- [ ] Strapi CORS configured to allow `https://greenwoodscity.in`
- [ ] Strapi API permissions enabled for Public role
- [ ] Strapi is running and accessible
- [ ] Next.js app restarted with `--update-env`
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows successful API calls to Strapi

---

## Quick Test Commands

```bash
# 1. Check environment variable
pm2 env 0 | grep STRAPI_URL

# 2. Test Strapi API accessibility
curl https://admin.greenwoodscity.in/api/news-articles

# 3. Check Next.js logs
pm2 logs greenwood-city --lines 50

# 4. Restart with environment update
pm2 restart greenwood-city --update-env

# 5. Verify Strapi is running
curl -I https://admin.greenwoodscity.in/admin
```

---

## Still Not Working?

1. **Check Strapi logs** on Strapi server
2. **Check Next.js logs** on VPS server
3. **Test API directly** with curl/Postman
4. **Verify network connectivity** between servers
5. **Check firewall rules** - ensure ports are open
6. **Verify DNS** - ensure domains resolve correctly

---

## Related Files

- `deploy/env.production.template` - Environment variable template
- `deploy/FIX_STRAPI_PRODUCTION.md` - Initial Strapi setup
- `src/lib/strapi.ts` - Strapi API client
- `src/lib/api.ts` - API functions using Strapi

