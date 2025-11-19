# Fix: Security Headers Not Reflecting on Server

## Problem
- Security headers (CSP, HSTS, X-Frame-Options, etc.) configured in `next.config.mjs` are not appearing in HTTP responses
- Changes to `next.config.mjs` are not taking effect on the production server

## Root Cause
Next.js configuration changes (including security headers) require:
1. **Rebuilding the application** - `next.config.mjs` is read during build time
2. **Restarting the server** - New build must be loaded

Simply restarting PM2 without rebuilding won't apply the changes.

## Solution

### Step 1: Commit and Push Changes Locally (if using Git)

**On your local machine:**

```bash
# Navigate to project directory
cd /path/to/your/project

# Check what files changed
git status

# Add all changes
git add .

# Commit changes
git commit -m "Update security headers and configuration"

# Push to remote repository
git push origin main
```

### Step 2: Pull Latest Changes on Server

**SSH into your VPS server:**

```bash
ssh root@31.97.232.51
cd /var/www/greenwood-city

# Pull latest changes from Git
git pull origin main

# If you get authentication errors, you may need to:
# - Set up SSH keys, or
# - Use HTTPS with credentials
```

### Step 3: Clean and Rebuild

```bash
# Stop PM2 process
pm2 stop greenwood-city

# Remove old build artifacts
rm -rf .next
rm -rf node_modules/.cache
rm -rf out

# Rebuild the application (this reads next.config.mjs)
npm run build

# Restart PM2 with updated environment
pm2 restart greenwood-city --update-env
pm2 save
```

### Step 4: Verify Security Headers

Test that security headers are present:

```bash
# Test locally on server
curl -I http://localhost:3000

# Should show headers like:
# Strict-Transport-Security: max-age=31536000; includeSubDomains
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
# Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...
# Referrer-Policy: strict-origin-when-cross-origin
# Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()

# Test via domain
curl -I https://greenwoodscity.in
```

### Step 5: Check Browser Developer Tools

1. Open `https://greenwoodscity.in` in your browser
2. Open Developer Tools (F12)
3. Go to **Network** tab
4. Reload the page
5. Click on the main document request
6. Check **Response Headers** section
7. Verify all security headers are present

## Quick Fix Command (One-liner)

```bash
cd /var/www/greenwood-city && pm2 stop greenwood-city && rm -rf .next node_modules/.cache out && npm run build && pm2 restart greenwood-city --update-env && pm2 save && curl -I http://localhost:3000 | grep -i "strict-transport\|x-frame\|content-security"
```

## Security Headers Checklist

After rebuild, verify these headers are present:

- ✅ **Strict-Transport-Security** - Forces HTTPS
- ✅ **X-Frame-Options** - Prevents clickjacking
- ✅ **X-Content-Type-Options** - Prevents MIME sniffing
- ✅ **Content-Security-Policy** - Controls resource loading
- ✅ **Referrer-Policy** - Controls referrer information
- ✅ **Permissions-Policy** - Controls browser features

## Troubleshooting

### If headers still don't appear:

1. **Check if build succeeded:**
   ```bash
   pm2 logs greenwood-city --lines 50
   # Look for build errors
   ```

2. **Verify next.config.mjs is correct:**
   ```bash
   cat /var/www/greenwood-city/next.config.mjs
   # Check that headers() function exists
   ```

3. **Check if Nginx is stripping headers:**
   ```bash
   # Test directly against Next.js (bypassing Nginx)
   curl -I http://localhost:3000
   
   # If headers appear here but not via domain, Nginx might be stripping them
   ```

4. **Verify Nginx is proxying correctly:**
   ```bash
   cat /etc/nginx/sites-available/greenwood-city
   # Ensure proxy_pass is set to http://localhost:3000
   ```

5. **Check for Nginx header modifications:**
   ```bash
   # Look for add_header or proxy_hide_header directives
   grep -i "add_header\|proxy_hide_header" /etc/nginx/sites-available/greenwood-city
   ```

### If CSP is blocking resources:

1. **Check browser console** for CSP violations
2. **Update CSP directives** in `next.config.mjs` if needed
3. **Rebuild** after making changes

### If build fails:

1. **Check Node.js version:**
   ```bash
   node --version
   # Should be 18.x or 20.x
   ```

2. **Check npm version:**
   ```bash
   npm --version
   ```

3. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

4. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

## Important Notes

### When Security Headers Are Applied

Security headers from `next.config.mjs` are:
- ✅ Applied to **all routes** matching the `source` pattern
- ✅ Applied at **build time** (not runtime)
- ✅ Included in **every HTTP response** from Next.js

### When to Rebuild

You **MUST rebuild** after changing:
- `next.config.mjs` (including security headers)
- `next.config.js`
- Environment variables used in config
- Any build-time configuration

You **don't need to rebuild** for:
- Content changes (pages, components)
- API route logic changes
- Environment variable changes (if not used in config)

### Nginx Considerations

If you're using Nginx as a reverse proxy:
- Headers from Next.js are passed through automatically
- Nginx can add additional headers with `add_header`
- Nginx can hide headers with `proxy_hide_header`
- Ensure Nginx isn't stripping security headers

## Prevention

### Automated Rebuild Script

Create a script to automate security updates:

```bash
#!/bin/bash
# File: scripts/update-security.sh

set -e

cd /var/www/greenwood-city

echo "🛡️  Updating security headers..."

# Pull latest changes
git pull origin main

# Stop, clean, rebuild, restart
pm2 stop greenwood-city
rm -rf .next node_modules/.cache out
npm run build
pm2 restart greenwood-city --update-env
pm2 save

echo "✅ Security headers updated!"
echo "🔍 Verifying headers..."
curl -I http://localhost:3000 | grep -i "strict-transport\|x-frame\|content-security"
```

Make it executable:
```bash
chmod +x scripts/update-security.sh
```

### Monitor Security Headers

Add a monitoring check:

```bash
# Add to cron: Check security headers daily
0 2 * * * curl -I https://greenwoodscity.in | grep -q "Strict-Transport-Security" || echo "Security headers missing!" | mail -s "Security Alert" admin@example.com
```

## Expected Security Headers

After successful deployment, you should see:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: http://admin.greenwoodscity.in https://admin.greenwoodscity.in http://localhost:1337 https:; connect-src 'self' http://admin.greenwoodscity.in https://admin.greenwoodscity.in http://localhost:1337 https:; worker-src 'self' blob:; manifest-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests
```

