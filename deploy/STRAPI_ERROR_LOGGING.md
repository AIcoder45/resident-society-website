# Strapi Error Logging and Debugging Guide

## Overview

Enhanced error logging has been added to help identify and debug Strapi connectivity issues in production. All errors are now logged to the console/PM2 logs with actionable error messages.

---

## What Changed

### Before
- ❌ Errors only logged in development mode
- ❌ Silent failures in production
- ❌ No actionable error messages
- ❌ Hard to debug connectivity issues

### After
- ✅ Errors logged in both development and production
- ✅ Detailed error messages with actionable steps
- ✅ Specific error messages for common issues (CORS, 404, 403, network errors)
- ✅ Easy to identify problems from PM2 logs

---

## Error Logging Features

### 1. **Startup Configuration Logging**

When the app starts, it logs Strapi connection status:

**If STRAPI_URL is set:**
```
✅ [Strapi] Connected to: https://admin.greenwoodscity.in
```

**If STRAPI_URL is NOT set:**
```
⚠️  [Strapi] STRAPI_URL not configured - using JSON fallback
```

### 2. **API Request Logging**

**Success (Production):**
```
✅ [News] Fetched 5 articles from Strapi
```

**Error (Production):**
```
❌ [News] Strapi connection failed: {
  error: "Strapi API error: 403 Forbidden",
  strapiUrl: "https://admin.greenwoodscity.in",
  endpoint: "/api/news-articles",
  action: "Falling back to JSON files"
}
❌ [News] Full error details: Error: Strapi API error: 403 Forbidden
⚠️  Access forbidden: https://admin.greenwoodscity.in/api/news-articles
💡 Check Strapi API permissions (Settings → Users & Permissions → Roles → Public).
```

### 3. **Specific Error Messages**

The system now provides specific error messages for common issues:

#### Network/Connection Errors
```
❌ [Strapi] Network Error: Cannot connect to https://admin.greenwoodscity.in/api/news-articles
💡 Possible causes:
   - Strapi server is down or unreachable
   - Network connectivity issue
   - DNS resolution failed for https://admin.greenwoodscity.in
   - Firewall blocking connection
   - SSL certificate issue

🔧 Action: Check Strapi server status and network connectivity.
```

#### CORS Errors
```
❌ [Strapi] CORS Error: Access to fetch at '...' has been blocked by CORS policy
💡 Fix: Add https://greenwoodscity.in to Strapi CORS allowed origins
   (Strapi Admin → Settings → Security → CORS)
```

#### 404 Not Found
```
❌ [Strapi] API Error: 404 Not Found
⚠️  Endpoint not found: https://admin.greenwoodscity.in/api/news-articles
💡 Check if the collection type exists in Strapi and is published.
```

#### 403 Forbidden
```
❌ [Strapi] API Error: 403 Forbidden
⚠️  Access forbidden: https://admin.greenwoodscity.in/api/news-articles
💡 Check Strapi API permissions (Settings → Users & Permissions → Roles → Public).
```

#### 500 Server Error / CORS Issue
```
❌ [Strapi] API Error: 500 Internal Server Error
⚠️  Server error or CORS issue: https://admin.greenwoodscity.in/api/news-articles
💡 Check:
   - Strapi is running
   - CORS is configured (Settings → Security → CORS)
   - SSL certificate is valid
```

---

## How to View Logs

### Using PM2 (Production)

```bash
# View all logs
pm2 logs greenwood-city

# View last 100 lines
pm2 logs greenwood-city --lines 100

# View only Strapi-related logs
pm2 logs greenwood-city --lines 200 | grep -i strapi

# View only errors
pm2 logs greenwood-city --lines 200 | grep "❌"

# Follow logs in real-time
pm2 logs greenwood-city --follow
```

### Filtering Logs

```bash
# View Strapi connection status
pm2 logs greenwood-city | grep "\[Strapi\]"

# View errors only
pm2 logs greenwood-city | grep "❌"

# View warnings
pm2 logs greenwood-city | grep "⚠️"

# View successful connections
pm2 logs greenwood-city | grep "✅"
```

---

## Common Scenarios

### Scenario 1: Strapi Not Connected

**What you'll see:**
```
⚠️  [Strapi] STRAPI_URL not configured - using JSON fallback
⚠️  [News] STRAPI_URL not set, using JSON fallback
```

**Action:**
1. Check `.env.production` file exists
2. Verify `STRAPI_URL` is set correctly
3. Restart PM2: `pm2 restart greenwood-city --update-env`

### Scenario 2: CORS Error

**What you'll see:**
```
❌ [Strapi] Fetch Error: {
  error: "Access to fetch at 'https://admin.greenwoodscity.in/api/news-articles' from origin 'https://greenwoodscity.in' has been blocked by CORS policy",
  url: "https://admin.greenwoodscity.in/api/news-articles",
  ...
}
❌ [Strapi] CORS Error: ...
💡 Fix: Add https://greenwoodscity.in to Strapi CORS allowed origins
```

**Action:**
1. Login to Strapi Admin: `https://admin.greenwoodscity.in/admin`
2. Go to: Settings → Security → CORS
3. Add `https://greenwoodscity.in` to allowed origins
4. Save and restart Strapi

### Scenario 3: 403 Forbidden

**What you'll see:**
```
❌ [Strapi] API Error: {
  status: 403,
  statusText: "Forbidden",
  ...
}
⚠️  Access forbidden: https://admin.greenwoodscity.in/api/news-articles
💡 Check Strapi API permissions (Settings → Users & Permissions → Roles → Public).
```

**Action:**
1. Login to Strapi Admin
2. Go to: Settings → Users & Permissions → Roles → Public
3. Enable `find` and `findOne` for all content types
4. Save

### Scenario 4: Network Error

**What you'll see:**
```
❌ [Strapi] Network Error: Cannot connect to https://admin.greenwoodscity.in/api/news-articles
💡 Possible causes:
   - Strapi server is down or unreachable
   - Network connectivity issue
   ...
```

**Action:**
1. Check if Strapi is running: `curl https://admin.greenwoodscity.in/api/news-articles`
2. Check DNS resolution
3. Check firewall rules
4. Verify SSL certificate

### Scenario 5: 404 Not Found

**What you'll see:**
```
❌ [Strapi] API Error: {
  status: 404,
  ...
}
⚠️  Endpoint not found: https://admin.greenwoodscity.in/api/news-articles
💡 Check if the collection type exists in Strapi and is published.
```

**Action:**
1. Verify collection type name matches (e.g., `news-articles` not `news`)
2. Check if content is published (not draft)
3. Verify collection type exists in Strapi

---

## Log Format

All logs follow this format:

```
[Emoji] [Category] Message: Details
```

**Emojis:**
- ✅ = Success
- ❌ = Error
- ⚠️ = Warning
- 🔍 = Debug/Info
- 🔧 = Configuration

**Categories:**
- `[Strapi]` = Core Strapi connection
- `[News]` = News API calls
- `[Events]` = Events API calls
- `[Gallery]` = Gallery API calls
- etc.

---

## Testing Error Logging

To test error logging:

1. **Temporarily break Strapi connection:**
   ```bash
   # On VPS
   cd /var/www/greenwood-city
   nano .env.production
   # Change STRAPI_URL to invalid URL
   STRAPI_URL=https://invalid-url.test
   pm2 restart greenwood-city --update-env
   ```

2. **Check logs:**
   ```bash
   pm2 logs greenwood-city --lines 50
   ```

3. **You should see:**
   ```
   ❌ [Strapi] Network Error: Cannot connect to https://invalid-url.test/api/...
   ```

4. **Fix and restore:**
   ```bash
   # Restore correct URL
   STRAPI_URL=https://admin.greenwoodscity.in
   pm2 restart greenwood-city --update-env
   ```

---

## Best Practices

1. **Monitor logs regularly:**
   ```bash
   # Set up log monitoring
   pm2 logs greenwood-city --lines 100 | grep "❌"
   ```

2. **Check logs after deployment:**
   ```bash
   pm2 logs greenwood-city --lines 50 | grep -E "\[Strapi\]|❌|⚠️"
   ```

3. **Set up alerts** for critical errors (optional):
   - Use PM2 monitoring tools
   - Set up log aggregation (e.g., Logtail, Datadog)
   - Configure email alerts for error patterns

4. **Keep logs clean:**
   - Errors are logged, but don't spam
   - Success messages are minimal in production
   - Full details available when errors occur

---

## Troubleshooting

### Logs not showing?

1. **Check PM2 is running:**
   ```bash
   pm2 status
   ```

2. **Check log file location:**
   ```bash
   pm2 logs greenwood-city --lines 10
   ```

3. **Restart PM2:**
   ```bash
   pm2 restart greenwood-city
   ```

### Too many logs?

The logging is designed to be minimal in production:
- Only errors and warnings are logged
- Success messages are brief
- Full details only on errors

If you see too many logs, check:
- Are there repeated errors? (fix the root cause)
- Is Strapi constantly failing? (check connectivity)

---

## Related Documentation

- `deploy/FIX_STRAPI_CONNECTION.md` - Troubleshooting Strapi connection
- `deploy/FIX_STRAPI_PRODUCTION.md` - Initial Strapi setup
- `deploy/FIX_PRODUCTION_ISSUES.md` - Production issues guide

---

## Summary

With enhanced error logging:
- ✅ All errors are visible in PM2 logs
- ✅ Error messages include actionable steps
- ✅ Easy to identify and fix connectivity issues
- ✅ No more silent failures

**Check your logs regularly to catch issues early!**

