#!/bin/bash

# Quick update script for Greenwood City Website
# Run this script to update your application after code changes

set -e

APP_DIR="/var/www/greenwood-city"

echo "=========================================="
echo "Updating Greenwood City Website"
echo "=========================================="

cd ${APP_DIR}

# Pull latest changes (if using Git)
if [ -d ".git" ]; then
    echo "→ Pulling latest changes from Git..."
    git pull origin main
else
    echo "→ Not a Git repository, skipping pull"
fi

# Install/update dependencies (including devDependencies for build)
echo "→ Installing dependencies..."
npm install

# Rebuild application
echo "→ Building application..."
npm run build

# Restart PM2
echo "→ Restarting application..."
pm2 restart greenwood-city

echo "=========================================="
echo "Update completed successfully!"
echo "=========================================="
echo ""
echo "Check status: pm2 status"
echo "View logs: pm2 logs greenwood-city"

