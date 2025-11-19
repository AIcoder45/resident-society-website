#!/bin/bash

# Production Rebuild Script
# Cleans and rebuilds the Next.js application to fix chunk load errors

set -e

echo "🚀 Starting production rebuild..."

# Get the project directory
PROJECT_DIR="${1:-/var/www/greenwood-city}"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Error: Directory $PROJECT_DIR does not exist"
    exit 1
fi

cd "$PROJECT_DIR"

echo "📁 Working directory: $(pwd)"

# Step 1: Stop PM2 process
echo "⏸️  Stopping PM2 process..."
pm2 stop greenwood-city || echo "⚠️  PM2 process not running or doesn't exist"

# Step 2: Clean build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf out
rm -rf .next/cache

# Step 3: Clear npm cache
echo "🗑️  Clearing npm cache..."
npm cache clean --force || true

# Step 4: Verify dependencies
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies exist"
fi

# Step 5: Build the application
echo "🏗️  Building application..."
npm run build

# Step 6: Verify build succeeded
if [ -d ".next" ]; then
    echo "✅ Build completed successfully!"
    
    # Step 7: Restart PM2
    echo "🔄 Restarting PM2..."
    pm2 restart greenwood-city --update-env || pm2 start ecosystem.config.js || pm2 start npm --name greenwood-city -- start
    pm2 save
    
    echo ""
    echo "✅ Production rebuild completed!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Clear browser cache (Ctrl+Shift+R)"
    echo "   2. Unregister service worker if PWA installed"
    echo "   3. Test the website: https://greenwoodscity.in"
    echo ""
    echo "📊 Check PM2 status:"
    pm2 status
else
    echo "❌ Build failed! Check the errors above."
    exit 1
fi

