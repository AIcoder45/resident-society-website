# Fix: Build Error - VAPID Keys Missing

## Problem
```
Error: No key set vapidDetails.publicKey
Error: Failed to collect page data for /api/webhooks/strapi
```

This happens because the webhook route was trying to initialize VAPID keys at module load time (during build), but VAPID keys are optional and may not be set.

## Solution

The code has been updated to:
1. Only initialize VAPID keys if they are provided
2. Make push notifications optional (won't fail build if keys are missing)
3. Return gracefully if VAPID keys are not configured

## Quick Fix

The fix is already in the code. Just rebuild:

```bash
ssh root@31.97.232.51
cd /var/www/greenwood-city

# Pull latest changes (if using git)
git pull origin main

# Rebuild
npm run build

# Restart
pm2 restart greenwood-city
```

## VAPID Keys are Optional

**Important:** VAPID keys are now optional:
- ✅ Build will succeed without VAPID keys
- ✅ Application will run without VAPID keys
- ⚠️ Push notifications will be disabled if keys are not set
- ✅ Webhook endpoint will return success but won't send notifications

## To Enable Push Notifications

If you want to enable push notifications:

1. **Generate VAPID keys:**
   ```bash
   npm install -g web-push
   web-push generate-vapid-keys
   ```

2. **Add to `.env.production`:**
   ```env
   VAPID_PUBLIC_KEY=your-public-key
   VAPID_PRIVATE_KEY=your-private-key
   VAPID_EMAIL=mailto:your-email@example.com
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
   ```

3. **Restart application:**
   ```bash
   pm2 restart greenwood-city
   ```

---

**Note:** The application will build and run successfully even without VAPID keys. Push notifications are an optional feature.

