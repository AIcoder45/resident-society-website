# Fix Build Dependencies Error

## Problem

Getting errors during build:
```
Error: Cannot find module 'tailwindcss'
Module not found: Can't resolve '@/components/ui/breadcrumb'
```

## Root Cause

1. **Tailwindcss missing**: Using `npm install --production` skips devDependencies, but Next.js build requires them
2. **Missing component**: Component files may not have been uploaded to VPS

---

## Solution

### Fix 1: Install All Dependencies (Including DevDependencies)

**On your VPS:**

```bash
cd /var/www/greenwood-city

# Remove node_modules if it exists
rm -rf node_modules package-lock.json

# Install ALL dependencies (including devDependencies)
npm install

# Verify tailwindcss is installed
npm list tailwindcss
```

**Why?** Next.js build process requires devDependencies like:
- `tailwindcss` - for CSS processing
- `typescript` - for type checking
- `postcss` - for CSS processing
- `autoprefixer` - for CSS vendor prefixes
- `eslint` - for code linting

These are needed during build time, even in production.

---

### Fix 2: Ensure All Files Are Uploaded

**Check if breadcrumb component exists:**

```bash
# On VPS
ls -la /var/www/greenwood-city/src/components/ui/breadcrumb.tsx
```

**If missing, upload it:**

**From your local machine:**
```bash
# Upload the component file
scp src/components/ui/breadcrumb.tsx root@31.97.232.51:/var/www/greenwood-city/src/components/ui/

# Or upload entire components directory
scp -r src/components root@31.97.232.51:/var/www/greenwood-city/src/
```

**Or clone from Git:**
```bash
# On VPS
cd /var/www/greenwood-city
git pull
```

---

### Fix 3: Clean Build

**After fixing dependencies:**

```bash
cd /var/www/greenwood-city

# Clean previous build
rm -rf .next

# Rebuild
npm run build
```

---

## Complete Fix Script

**Run this on your VPS:**

```bash
#!/bin/bash
cd /var/www/greenwood-city

echo "1. Removing old dependencies..."
rm -rf node_modules package-lock.json .next

echo "2. Installing all dependencies..."
npm install

echo "3. Verifying critical dependencies..."
npm list tailwindcss typescript postcss autoprefixer

echo "4. Checking for missing components..."
if [ ! -f "src/components/ui/breadcrumb.tsx" ]; then
    echo "⚠️  breadcrumb.tsx is missing!"
    echo "   Upload it or pull from Git"
fi

echo "5. Building application..."
npm run build

echo "✅ Build complete!"
```

**Make executable and run:**
```bash
chmod +x fix-build.sh
./fix-build.sh
```

---

## Updated Installation Command

**Always use this for Next.js projects:**

```bash
# ✅ CORRECT - Install all dependencies
npm install

# ❌ WRONG - Skips devDependencies needed for build
npm install --production
```

**Note:** After build, you can optionally remove devDependencies for runtime, but Next.js still needs some of them at runtime for certain features.

---

## Production Optimization (Optional)

**If you want to minimize node_modules size after build:**

```bash
# After successful build
cd /var/www/greenwood-city

# Remove devDependencies (optional, may break some features)
npm prune --production

# But be aware: Some Next.js features may require devDependencies
# Test thoroughly before doing this
```

**Recommended:** Keep all dependencies installed for Next.js production builds.

---

## Verify Fix

**After fixing:**

```bash
# Check dependencies
npm list tailwindcss
npm list typescript

# Check components
ls -la src/components/ui/breadcrumb.tsx

# Try build
npm run build

# If successful, start app
pm2 restart greenwood-city
```

---

## Common Mistakes

### ❌ Wrong: Installing only production dependencies
```bash
npm install --production  # This skips tailwindcss!
```

### ✅ Correct: Install all dependencies
```bash
npm install  # Includes devDependencies needed for build
```

### ❌ Wrong: Building before installing dependencies
```bash
npm run build  # Fails if dependencies not installed
```

### ✅ Correct: Install then build
```bash
npm install
npm run build
```

---

## Summary

1. **Install ALL dependencies**: `npm install` (not `--production`)
2. **Verify files uploaded**: Check component files exist
3. **Clean build**: Remove `.next` folder before rebuilding
4. **Rebuild**: `npm run build`

**The key issue:** Next.js requires devDependencies for the build process, so always use `npm install` without the `--production` flag.

