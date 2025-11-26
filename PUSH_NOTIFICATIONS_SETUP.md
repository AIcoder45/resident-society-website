# Push Notifications - Quick Setup Guide

## 🚀 Quick Start

### Step 1: Generate VAPID Keys

```bash
npm install -g web-push
web-push generate-vapid-keys
```

Save the Public Key and Private Key.

### Step 2: Install Dependencies

```bash
npm install web-push
npm install --save-dev @types/web-push
```

### Step 3: Configure Environment Variables

Add to `.env.local`:

```env
# VAPID Keys (from Step 1)
VAPID_PUBLIC_KEY=your-public-key-here
VAPID_PRIVATE_KEY=your-private-key-here
VAPID_EMAIL=mailto:your-email@example.com

# Public key for client-side (same as VAPID_PUBLIC_KEY)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key-here

# Strapi Configuration
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-strapi-api-token-here
```

### Step 4: Strapi Setup

#### 4.1 Create Push Subscription Content Type

1. Go to Strapi Admin → Content-Type Builder
2. Create new collection type: `push-subscription`
3. Add fields:
   - `endpoint` (Text, Required)
   - `keys` (JSON, Required)
   - `user` (Relation to User, Optional)
   - `device` (Text, Optional)

#### 4.2 Configure Permissions

**Settings → Roles → Public:**
- Allow `find` and `create` for `push-subscription`

**Settings → Roles → Authenticated:**
- Allow `find`, `create`, `delete` for `push-subscription`

#### 4.3 Create Webhook

**Settings → Webhooks → Create New:**

- **Name**: Content Updates
- **URL**: `https://your-domain.com/api/webhooks/strapi`
- **Events**: 
  - ✅ Entry create
  - ✅ Entry update
  - ✅ Entry delete
- **Headers**:
  ```
  Authorization: Bearer YOUR_STRAPI_API_TOKEN
  ```

### Step 5: Add Push Notification Button

Add to your header or settings page:

```tsx
import { PushNotificationManager } from "@/components/shared/PushNotificationManager";

// In your component
<PushNotificationManager />
```

### Step 6: Test

1. Build and start your app:
   ```bash
   npm run build
   npm run start
   ```

2. Visit your app and click "Enable Notifications"
3. Grant permission
4. Create/update content in Strapi
5. You should receive a push notification!

## 📋 Files Created

- ✅ `src/app/api/push/subscribe/route.ts` - Subscription API
- ✅ `src/app/api/webhooks/strapi/route.ts` - Webhook handler
- ✅ `src/components/shared/PushNotificationManager.tsx` - UI component
- ✅ `public/sw.js` - Updated with push handlers

## 🧪 Testing Checklist

- [ ] VAPID keys generated and configured
- [ ] Environment variables set
- [ ] Push subscription content type created in Strapi
- [ ] Permissions configured
- [ ] Webhook created
- [ ] Service worker registered
- [ ] Push notifications enabled
- [ ] Content change triggers notification

## 🔍 Troubleshooting

### Notification permission denied
- Check browser settings
- Ensure HTTPS (required for push)
- Check console for errors

### Webhook not triggering
- Verify webhook URL is correct
- Check Authorization header
- Verify Strapi API token

### Notifications not received
- Check service worker registration
- Verify VAPID keys match
- Check browser console for errors
- Verify subscription is saved in Strapi

## 📚 More Details

See `PUSH_NOTIFICATIONS_IMPLEMENTATION.md` for complete documentation.



