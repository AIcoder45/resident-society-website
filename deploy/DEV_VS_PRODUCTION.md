# Development vs Production Mode

## Problem
You're running `npm run dev` which is:
- ❌ Development mode (not for production)
- ❌ Trying to use port 3001 (Nginx expects port 3000)
- ❌ Not optimized for production
- ❌ Should be managed by PM2, not run manually

## Solution: Use Production Mode

### Stop the Dev Server

Press `Ctrl+C` to stop the dev server.

### Check PM2 Status

```bash
# Check if PM2 is already running your app
pm2 status

# If greenwood-city is running, that's good!
# If not, start it with PM2
```

### Use Production Mode

**For Production, you should use:**

```bash
# Production mode (what PM2 uses)
npm start
```

**NOT:**
```bash
# Development mode (only for local development)
npm run dev
```

## Difference

| Mode | Command | Port | Use Case |
|------|---------|------|----------|
| **Development** | `npm run dev` | Auto (3000, 3001, etc.) | Local development only |
| **Production** | `npm start` | Fixed (3000) | Production server |

## Correct Setup for Production

### Option 1: Use PM2 (Recommended)

```bash
# PM2 is already configured to run production mode
cd /var/www/greenwood-city

# Check status
pm2 status

# If not running, start it
pm2 start ecosystem.config.js

# PM2 will run: npm start (production mode)
```

### Option 2: Manual Production Start (Not Recommended)

Only if PM2 isn't working:

```bash
cd /var/www/greenwood-city

# Set production environment
export NODE_ENV=production

# Start production server
npm start
```

**But this will stop when you close the terminal. Use PM2 instead!**

## Why Port 3000 is in Use

Port 3000 is likely already in use by:
- Your PM2 process (if it's running)
- Another instance of the app

Check:

```bash
# See what's using port 3000
netstat -tulpn | grep 3000

# Or
lsof -i :3000

# Check PM2
pm2 status
```

## Fix: Use PM2 for Production

```bash
# Stop any manual dev server (Ctrl+C if running)

# Check PM2
pm2 status

# If greenwood-city is not in PM2, start it:
cd /var/www/greenwood-city
pm2 start ecosystem.config.js
pm2 save

# Verify it's running on port 3000
netstat -tulpn | grep 3000

# Test
curl http://localhost:3000
```

## PM2 Ecosystem Config

Your `ecosystem.config.js` is configured to run:
```javascript
script: 'npm',
args: 'start',  // This runs production mode
```

So PM2 automatically runs `npm start` (production), not `npm run dev` (development).

## Summary

**❌ Don't run:**
```bash
npm run dev  # Development mode
```

**✅ Use PM2 instead:**
```bash
pm2 start ecosystem.config.js  # Runs npm start (production)
```

**✅ Or manually (temporary):**
```bash
npm start  # Production mode
```

## After Fixing

Once PM2 is running production mode on port 3000:

1. ✅ App will be on port 3000 (not 3001)
2. ✅ Nginx can proxy correctly
3. ✅ SSL certificate will work
4. ✅ App will auto-restart if it crashes
5. ✅ Production optimizations enabled

**Stop the dev server and use PM2 with production mode!**



