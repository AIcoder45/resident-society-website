# VPS Deployment Guide

## Common Build Errors on Linux VPS

### Issue: Module Not Found Errors

Linux VPS servers are **case-sensitive**, while Windows is not. This can cause import errors if file names don't match exactly.

## Pre-Deployment Checklist

1. **Clear build cache on VPS:**
   ```bash
   rm -rf .next
   rm -rf node_modules
   ```

2. **Reinstall dependencies:**
   ```bash
   npm install
   ```

3. **Verify all component files exist:**
   ```bash
   ls -la src/components/ui/
   ls -la src/components/shared/
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

## Required Component Files

Ensure these files exist on your VPS:

- `src/components/ui/breadcrumb.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/badge.tsx`
- `src/components/shared/Section.tsx`
- `src/components/shared/RichTextContent.tsx`

## Deployment Steps

1. **Upload all files** (ensure case-sensitive file names match)
2. **Install dependencies:** `npm install`
3. **Clear cache:** `rm -rf .next`
4. **Build:** `npm run build`
5. **Start:** `npm start`

## Troubleshooting

If you still get "Module not found" errors:

1. **Check file names match imports exactly (case-sensitive)**
   ```bash
   # On VPS, verify files exist:
   ls -la src/components/ui/breadcrumb.tsx
   ls -la src/components/shared/Section.tsx
   ```

2. **Verify `tsconfig.json` has correct path aliases**
   ```json
   "paths": {
     "@/*": ["./src/*"]
   }
   ```

3. **Ensure all files were uploaded (not just changed files)**
   - If using Git, make sure all files are committed and pushed
   - If using FTP/SFTP, upload the entire `src/components` directory

4. **Clear everything and rebuild:**
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

5. **Check Git case sensitivity (if using Git):**
   ```bash
   git config core.ignorecase false
   git add -A
   git commit -m "Fix case sensitivity"
   ```

6. **Run verification script:**
   ```bash
   npm run verify
   ```

7. **Debug build:**
   ```bash
   npm run build -- --debug
   ```

## Quick Fix Commands

Run these commands on your VPS in order:

```bash
# 1. Clean everything
rm -rf .next node_modules

# 2. Verify components exist
npm run verify

# 3. Install dependencies
npm install

# 4. Build
npm run build
```

Or use the automated script:
```bash
chmod +x scripts/deploy-vps.sh
./scripts/deploy-vps.sh
```

