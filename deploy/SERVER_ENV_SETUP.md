# Server Environment Variables Setup Guide

## Quick Steps to Create Environment File on Server

### Option 1: Using `.env.production` (Recommended for Production)

**Step 1: SSH into your server**
```bash
ssh root@31.97.232.51
```

**Step 2: Navigate to application directory**
```bash
cd /var/www/greenwood-city
```

**Step 3: Create `.env.production` file**

**Method A: Copy from template (if template exists)**
```bash
cp deploy/env.production.template .env.production
nano .env.production
```

**Method B: Create manually**
```bash
nano .env.production
```

**Step 4: Add the following content** (Update with your actual values):

```env
# Application Configuration
NODE_ENV=production
HOST=0.0.0.0
PORT=3000

# Strapi CMS Configuration
STRAPI_URL=https://admin.greenwoodscity.in
STRAPI_API_TOKEN=your-new-strapi-api-token-here

# Push Notifications - VAPID Keys (Optional)
# Generate new keys: web-push generate-vapid-keys
VAPID_PUBLIC_KEY=your-vapid-public-key-here
VAPID_PRIVATE_KEY=your-vapid-private-key-here
VAPID_EMAIL=mailto:info@greenwoodscity.in
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key-here
```

**Step 5: Save and exit**
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

**Step 6: Set secure permissions**
```bash
chmod 600 .env.production
```

**Step 7: Restart PM2 to load new environment variables**
```bash
pm2 restart greenwood-city --update-env
```

**Step 8: Verify environment variables are loaded**
```bash
pm2 env 0 | grep STRAPI_URL
pm2 env 0 | grep VAPID
```

---

### Option 2: Using `.env.local` (Also works, but `.env.production` is preferred)

If you specifically need `.env.local` on the server:

**Step 1-2: Same as above**

**Step 3: Create `.env.local` file**
```bash
nano .env.local
```

**Step 4: Add the same content as above**

**Step 5-8: Same as above**

---

## Important Notes

### ⚠️ Security Warning
**IMPORTANT**: The old credentials were exposed in git history. You MUST:

1. **Generate NEW Strapi API Token:**
   - Log into Strapi Admin: `https://admin.greenwoodscity.in/admin`
   - Go to Settings → API Tokens
   - Delete the old token (ending in `...6520d2`)
   - Create a new token and use it in `.env.production`

2. **Generate NEW VAPID Keys** (if using push notifications):
   ```bash
   npm install -g web-push
   web-push generate-vapid-keys
   ```
   Copy the generated keys to `.env.production`

### File Priority (Next.js)
Next.js loads environment files in this order (highest priority first):
1. `.env.local` (always loaded, except in test)
2. `.env.production.local` (production only)
3. `.env.production` (production only)
4. `.env` (always loaded)

**Recommendation**: Use `.env.production` for production servers.

---

## Quick Setup Script

You can also use the automated script:

```bash
ssh root@31.97.232.51
cd /var/www/greenwood-city
bash deploy/setup-env-production.sh
```

Then edit the file:
```bash
nano .env.production
```

---

## Verify Setup

### Check if file exists:
```bash
ls -la /var/www/greenwood-city/.env.production
```

### Check file permissions (should be 600):
```bash
ls -l /var/www/greenwood-city/.env.production
```

### View environment variables loaded by PM2:
```bash
pm2 env 0
```

### Test Strapi connection:
```bash
curl https://admin.greenwoodscity.in/api/news
```

---

## Troubleshooting

### If PM2 doesn't load environment variables:
```bash
# Stop PM2
pm2 stop greenwood-city

# Delete and restart with environment update
pm2 delete greenwood-city
pm2 start ecosystem.config.js
pm2 save
```

### If file permissions are wrong:
```bash
chmod 600 .env.production
chown root:root .env.production
```

### If you need to edit the file again:
```bash
nano /var/www/greenwood-city/.env.production
# After editing, restart PM2:
pm2 restart greenwood-city --update-env
```

---

## Required Environment Variables

### Required (for Strapi CMS):
- `STRAPI_URL` - Your Strapi CMS URL (without /api or /admin)
- `STRAPI_API_TOKEN` - API token from Strapi Admin

### Optional (for Push Notifications):
- `VAPID_PUBLIC_KEY` - Public VAPID key
- `VAPID_PRIVATE_KEY` - Private VAPID key
- `VAPID_EMAIL` - Email for VAPID (format: mailto:email@domain.com)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Same as VAPID_PUBLIC_KEY (for client-side)

### Application:
- `NODE_ENV=production` - Set to production
- `PORT=3000` - Port for Next.js server
- `HOST=0.0.0.0` - Bind to all interfaces

---

**Created**: 2024
**Last Updated**: After security fix



