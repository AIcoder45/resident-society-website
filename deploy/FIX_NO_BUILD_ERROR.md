# Fix "No Production Build" Error

## Problem

```
Error: Could not find a production build in the '.next' directory. 
Try building your app with 'next build' before starting the production server.
```

## Root Cause

The application is trying to start in production mode (`npm start`) but the build hasn't been created yet. Next.js requires a build before running in production.

---

## Quick Fix

**On your VPS:**

```bash
cd /var/www/greenwood-city

# Build the application
npm run build

# After build succeeds, restart PM2
pm2 restart greenwood-city
```

---

## Complete Fix Steps

### Step 1: Ensure Dependencies Are Installed

```bash
cd /var/www/greenwood-city

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
```

### Step 2: Build the Application

```bash
# Clean any previous failed builds (optional)
rm -rf .next

# Build the application
npm run build
```

**This will:**
- Compile TypeScript
- Process CSS with Tailwind
- Generate static pages
- Create optimized production build in `.next` directory

**Expected output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

### Step 3: Verify Build Exists

```bash
# Check if .next directory was created
ls -la .next

# Check for build manifest
ls -la .next/BUILD_ID
```

### Step 4: Start/Restart Application

```bash
# If PM2 process doesn't exist, start it
pm2 start ecosystem.config.js

# If PM2 process exists, restart it
pm2 restart greenwood-city

# Check status
pm2 status

# View logs
pm2 logs greenwood-city --lines 50
```

---

## All-in-One Fix Script

**Run this complete fix:**

```bash
#!/bin/bash
cd /var/www/greenwood-city

echo "1. Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
else
    echo "   Dependencies already installed"
fi

echo "2. Building application..."
rm -rf .next
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo "3. Restarting application..."
    pm2 restart greenwood-city || pm2 start ecosystem.config.js
    pm2 save
    
    echo "4. Checking status..."
    pm2 status
    
    echo ""
    echo "✅ Application should now be running!"
    echo "View logs: pm2 logs greenwood-city --follow"
else
    echo "❌ Build failed! Check errors above."
    exit 1
fi
```

**Make executable and run:**
```bash
chmod +x fix-build.sh
./fix-build.sh
```

---

## Common Issues During Build

### Issue 1: Missing Dependencies

**Error:** `Cannot find module 'tailwindcss'`

**Fix:**
```bash
npm install
```

### Issue 2: TypeScript Errors

**Error:** Type errors during build

**Fix:**
```bash
# Check TypeScript errors
npm run build 2>&1 | grep -i error

# Fix type errors or temporarily skip type checking
# (Not recommended for production)
```

### Issue 3: Out of Memory

**Error:** Build process killed due to memory

**Fix:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Or check system memory
free -h
```

### Issue 4: Missing Environment Variables

**Error:** Build fails due to missing env vars

**Fix:**
```bash
# Ensure .env.production exists
ls -la .env.production

# Check required variables
cat .env.production
```

---

## Verify Build Success

**After build, check:**

```bash
cd /var/www/greenwood-city

# 1. Check .next directory exists
ls -la .next

# 2. Check BUILD_ID exists
cat .next/BUILD_ID

# 3. Check static files
ls -la .next/static

# 4. Test production server locally
npm start
# (Press Ctrl+C after testing)
```

---

## PM2 Configuration Check

**Ensure PM2 is configured correctly:**

```bash
# Check ecosystem.config.js
cat ecosystem.config.js

# Should have:
# script: 'npm'
# args: 'start'
```

**Correct configuration:**
```javascript
module.exports = {
  apps: [{
    name: 'greenwood-city',
    script: 'npm',
    args: 'start',  // This runs 'npm start' which requires .next build
    cwd: '/var/www/greenwood-city',
    // ... rest of config
  }]
};
```

---

## Build Process Overview

```
1. npm install          → Install dependencies
2. npm run build        → Create production build in .next/
3. npm start            → Start production server (requires .next/)
4. PM2 manages process  → Keeps server running
```

**Important:** Always run `npm run build` before `npm start` in production!

---

## Prevention

**Add build check to deployment script:**

```bash
#!/bin/bash
cd /var/www/greenwood-city

# Always build before starting
if [ ! -f ".next/BUILD_ID" ]; then
    echo "No build found, building..."
    npm run build
fi

# Then start/restart
pm2 restart greenwood-city || pm2 start ecosystem.config.js
```

---

## Quick Reference

```bash
# Build application
cd /var/www/greenwood-city
npm run build

# Start/restart with PM2
pm2 restart greenwood-city

# Check status
pm2 status

# View logs
pm2 logs greenwood-city --lines 50
```

---

## Summary

**The error means:** No `.next` build directory exists.

**The fix:** Run `npm run build` before starting the app.

**The process:**
1. `npm install` - Install dependencies
2. `npm run build` - Create production build
3. `pm2 restart greenwood-city` - Start/restart app

**Always build before starting in production!**

