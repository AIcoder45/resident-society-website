#!/bin/bash

# Quick Environment Setup Script for Server
# Run this on your VPS server: bash deploy/QUICK_ENV_SETUP.sh

set -e

echo "=========================================="
echo "Setting up .env.production on server"
echo "=========================================="

cd /var/www/greenwood-city

# Check if .env.production already exists
if [ -f ".env.production" ]; then
    echo "⚠️  .env.production already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted. Keeping existing .env.production"
        exit 0
    fi
    # Backup existing file
    cp .env.production .env.production.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backed up existing .env.production"
fi

# Create .env.production from template if it exists
if [ -f "deploy/env.production.template" ]; then
    cp deploy/env.production.template .env.production
    echo "✅ Created .env.production from template"
else
    # Create basic .env.production
    cat > .env.production << 'EOF'
# Application Configuration
NODE_ENV=production
HOST=0.0.0.0
PORT=3000

# Strapi CMS Configuration
STRAPI_URL=https://admin.greenwoodscity.in
STRAPI_API_TOKEN=your-strapi-api-token-here

# Push Notifications - VAPID Keys (Optional)
# Generate new keys: web-push generate-vapid-keys
# VAPID_PUBLIC_KEY=your-vapid-public-key-here
# VAPID_PRIVATE_KEY=your-vapid-private-key-here
# VAPID_EMAIL=mailto:info@greenwoodscity.in
# NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key-here
EOF
    echo "✅ Created basic .env.production"
fi

# Set secure permissions
chmod 600 .env.production
echo "✅ Set secure permissions (600) on .env.production"

echo ""
echo "=========================================="
echo "✅ .env.production file created!"
echo "=========================================="
echo ""
echo "📝 Next steps:"
echo "1. Edit the file: nano .env.production"
echo "2. Update STRAPI_API_TOKEN with your new token"
echo "3. Add VAPID keys if using push notifications"
echo "4. Restart PM2: pm2 restart greenwood-city --update-env"
echo "5. Verify: pm2 env 0 | grep STRAPI_URL"
echo ""




