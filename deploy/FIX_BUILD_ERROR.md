# Fix: Build Error - Missing tailwindcss

## Problem
```
Error: Cannot find module 'tailwindcss'
```

This happens because `tailwindcss` and other build tools are in `devDependencies`, but the script was using `npm install --production` which skips devDependencies.

## Quick Fix (Run on VPS)

```bash
ssh root@31.97.232.51
cd /var/www/greenwood-city

# Install all dependencies (including devDependencies)
npm install

# Build the application
npm run build

# Restart PM2
pm2 restart greenwood-city
```

## Solution

The deployment scripts have been updated to use `npm install` (without `--production` flag) so that devDependencies like:
- `tailwindcss`
- `postcss`
- `autoprefixer`
- `typescript`
- `eslint`

are installed and available during the build process.

## Why This is Needed

Next.js build process requires devDependencies to:
- Compile TypeScript
- Process Tailwind CSS
- Run PostCSS transformations
- Lint and validate code

These tools are only needed during build time, not at runtime, but they must be present during `npm run build`.

---

**Note:** The updated scripts now handle this automatically. Future deployments will work correctly.

