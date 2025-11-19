# Deploy Changes to VPS Server

Complete guide for deploying code changes to your production server.

## Quick Deployment (One Command)

**On your local machine:**
```bash
# Commit and push changes
git add . && git commit -m "Your commit message" && git push origin main

# Then SSH and deploy (copy this entire command)
ssh root@31.97.232.51 "cd /var/www/greenwood-city && git pull origin main && pm2 stop greenwood-city && rm -rf .next node_modules/.cache out && npm run build && pm2 restart greenwood-city --update-env && pm2 save"
```

## Step-by-Step Deployment

### Step 1: Commit Changes Locally

**On your local machine:**

```bash
# Navigate to your project directory
cd C:\Users\hp\OneDrive\Desktop\Greenwood\SYS

# Check what files have changed
git status

# Add all changes
git add .

# Commit with a descriptive message
git commit -m "Update security headers, fix manifest, update dependencies"

# Push to remote repository
git push origin main
```

**If you haven't initialized git or connected to remote:**

```bash
# Initialize git (if not already done)
git init

# Add remote repository (replace with your actual repo URL)
git remote add origin https://github.com/yourusername/your-repo.git

# Or if using SSH
git remote add origin git@github.com:yourusername/your-repo.git

# Then commit and push
git add .
git commit -m "Initial commit"
git push -u origin main
```

### Step 2: Connect to VPS Server

```bash
ssh root@31.97.232.51
```

### Step 3: Navigate to Application Directory

```bash
cd /var/www/greenwood-city
```

### Step 4: Pull Latest Changes

```bash
# Pull latest code from Git
git pull origin main

# If you get authentication errors:
# Option 1: Use HTTPS with personal access token
git remote set-url origin https://YOUR_TOKEN@github.com/username/repo.git

# Option 2: Set up SSH keys on server
ssh-keygen -t rsa -b 4096 -C "server@greenwoodscity.in"
# Then add the public key to your GitHub account
```

### Step 5: Install Dependencies (if package.json changed)

```bash
# Only if package.json or package-lock.json changed
npm install
```

### Step 6: Clean and Rebuild

```bash
# Stop the application
pm2 stop greenwood-city

# Clean build artifacts
rm -rf .next
rm -rf node_modules/.cache
rm -rf out

# Rebuild the application
npm run build

# Check if build succeeded
ls -la .next
```

### Step 7: Restart Application

```bash
# Restart PM2 with updated environment
pm2 restart greenwood-city --update-env
pm2 save

# Check status
pm2 status
pm2 logs greenwood-city --lines 20
```

### Step 8: Verify Changes

```bash
# Test locally on server
curl -I http://localhost:3000

# Test via domain
curl -I https://greenwoodscity.in

# Check specific endpoints
curl -I https://greenwoodscity.in/manifest.json
```

## Automated Deployment Script

Create a script on the server for easier deployment:

**On server, create `/var/www/greenwood-city/deploy.sh`:**

```bash
#!/bin/bash
# Deployment script for Greenwood City website

set -e  # Exit on error

echo "🚀 Starting deployment..."

cd /var/www/greenwood-city

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies if needed
if git diff HEAD@{1} HEAD --name-only | grep -q "package.json\|package-lock.json"; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Stop application
echo "⏸️  Stopping application..."
pm2 stop greenwood-city || true

# Clean build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf out

# Build application
echo "🏗️  Building application..."
npm run build

# Restart application
echo "🔄 Restarting application..."
pm2 restart greenwood-city --update-env
pm2 save

echo "✅ Deployment completed!"
echo "📊 Application status:"
pm2 status

echo ""
echo "🔍 Verifying deployment..."
curl -I http://localhost:3000 | head -5
```

Make it executable:
```bash
chmod +x /var/www/greenwood-city/deploy.sh
```

Then deploy with:
```bash
ssh root@31.97.232.51 "cd /var/www/greenwood-city && ./deploy.sh"
```

## Troubleshooting

### Git Pull Fails

**Error: "Permission denied"**
```bash
# Check if you're in the right directory
pwd

# Check git remote URL
git remote -v

# Update remote URL if needed
git remote set-url origin https://YOUR_TOKEN@github.com/username/repo.git
```

**Error: "Could not resolve hostname"**
```bash
# Check internet connection
ping github.com

# Try using HTTPS instead of SSH
git remote set-url origin https://github.com/username/repo.git
```

### Build Fails

**Error: "Module not found"**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Error: "Out of memory"**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Changes Not Reflecting

1. **Check if build succeeded:**
   ```bash
   ls -la .next
   pm2 logs greenwood-city --lines 50
   ```

2. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or clear browser cache completely

3. **Check if PM2 restarted:**
   ```bash
   pm2 status
   pm2 logs greenwood-city --lines 20
   ```

4. **Verify files were updated:**
   ```bash
   # Check file modification time
   ls -la next.config.mjs
   ls -la src/app/manifest.ts
   ```

5. **Force rebuild:**
   ```bash
   pm2 stop greenwood-city
   rm -rf .next node_modules/.cache out
   npm run build
   pm2 restart greenwood-city --update-env
   ```

## Common Deployment Scenarios

### Deploying Security Header Changes

```bash
# On local: Commit changes
git add next.config.mjs
git commit -m "Update security headers"
git push origin main

# On server: Deploy
ssh root@31.97.232.51 "cd /var/www/greenwood-city && git pull && pm2 stop greenwood-city && rm -rf .next && npm run build && pm2 restart greenwood-city --update-env"
```

### Deploying New Dependencies

```bash
# On local: Update package.json, commit
git add package.json package-lock.json
git commit -m "Update dependencies"
git push origin main

# On server: Deploy with npm install
ssh root@31.97.232.51 "cd /var/www/greenwood-city && git pull && npm install && pm2 stop greenwood-city && rm -rf .next && npm run build && pm2 restart greenwood-city --update-env"
```

### Deploying Content Changes Only

```bash
# For content changes (pages, components), you may not need to rebuild
# But it's safer to rebuild anyway

ssh root@31.97.232.51 "cd /var/www/greenwood-city && git pull && pm2 restart greenwood-city"
```

## Best Practices

1. **Always test locally first** before deploying
2. **Commit frequently** with descriptive messages
3. **Pull before making changes** on server (if multiple people work on it)
4. **Check logs after deployment** to ensure no errors
5. **Verify changes** by testing the website
6. **Keep backups** of important files before major changes

## Quick Reference

```bash
# Full deployment command
cd /var/www/greenwood-city && \
git pull origin main && \
pm2 stop greenwood-city && \
rm -rf .next node_modules/.cache out && \
npm run build && \
pm2 restart greenwood-city --update-env && \
pm2 save

# Check if changes are live
curl -I https://greenwoodscity.in

# View logs
pm2 logs greenwood-city --lines 50
```

