#!/bin/bash

# VPS Deployment Script
# This script ensures a clean build on Linux VPS servers

set -e

echo "🚀 Starting VPS deployment process..."

# Step 1: Clean previous builds
echo "📦 Cleaning previous builds..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf out

# Step 2: Verify component files exist
echo "🔍 Verifying component files..."
node scripts/verify-components.js

# Step 3: Install/update dependencies
echo "📥 Installing dependencies..."
npm install

# Step 4: Build the project
echo "🏗️  Building project..."
npm run build

# Step 5: Verify build succeeded
if [ -d ".next" ]; then
    echo "✅ Build completed successfully!"
    echo "📝 Next steps:"
    echo "   - Run 'npm start' to start the production server"
    echo "   - Or configure PM2/systemd for auto-start"
else
    echo "❌ Build failed! Check the errors above."
    exit 1
fi

