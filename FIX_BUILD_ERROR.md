# Fix Build Errors on Windows

## Problems

### Error 1: EPERM
```
Error: EPERM: operation not permitted, open '.next\trace'
```

### Error 2: ENOTEMPTY
```
Error: ENOTEMPTY: directory not empty, rmdir 'C:\Users\hp\OneDrive\Desktop\Greenwood\SYS\.next\export'
```

These errors occur when OneDrive tries to sync the `.next` build folder, causing file permission conflicts, or when Next.js tries to remove non-empty directories on Windows.

## Solutions

### Solution 0: Automatic Cleanup (Now Built-In) ⭐

**The build process now automatically cleans build directories before building!**

The `prebuild` script runs `scripts/clean-build.js` which:
- Safely removes `.next/export` directory (handles ENOTEMPTY errors)
- Cleans `out` directory if it exists
- Handles Windows file locking issues gracefully

Just run:
```bash
npm run build
```

The cleanup happens automatically. If you need to clean manually:
```bash
npm run clean
```

### Solution 1: Exclude .next Folder from OneDrive Sync (Recommended)

1. **Right-click on the `.next` folder** in File Explorer
2. Select **"Always keep on this device"** or **"Free up space"**
3. Or exclude it from OneDrive sync:
   - Right-click OneDrive icon in system tray
   - Settings → Sync and backup → Advanced settings
   - Choose folders to sync → Uncheck your project folder's `.next` folder

### Solution 2: Move Project Outside OneDrive

1. Move the entire project folder outside OneDrive:
   ```
   From: C:\Users\hp\OneDrive\Desktop\Greenwood\SYS
   To:   C:\Projects\Greenwood\SYS
   ```

### Solution 3: Clean Build Folder Before Building

Run these commands before building:

```powershell
# Clean .next folder
if (Test-Path .next) { Remove-Item -Recurse -Force .next }

# Clean node_modules cache (if needed)
npm cache clean --force

# Rebuild
npm run build
```

### Solution 4: Run as Administrator

1. Right-click PowerShell/Command Prompt
2. Select "Run as Administrator"
3. Navigate to project folder
4. Run `npm run build`

### Solution 5: Close All Node Processes

```powershell
# Stop all Node processes
Get-Process node | Stop-Process -Force

# Then rebuild
npm run build
```

## Quick Fix Script

Create a file `clean-build.ps1`:

```powershell
# Stop any running dev servers
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Clean build folders
if (Test-Path .next) { Remove-Item -Recurse -Force .next }
if (Test-Path out) { Remove-Item -Recurse -Force out }

# Build
npm run build
```

Run it with: `.\clean-build.ps1`

## Prevention

Add to `.gitignore` (already done):
```
.next/
out/
node_modules/
```

## Most Common Fix

**The easiest solution is to exclude the `.next` folder from OneDrive sync:**

1. Open File Explorer
2. Navigate to your project folder
3. Right-click `.next` folder → Properties
4. Uncheck "Always keep on this device" if checked
5. Or pause OneDrive sync temporarily while building

