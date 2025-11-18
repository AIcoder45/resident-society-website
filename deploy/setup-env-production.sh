#!/bin/bash

# Script to create .env.production file from template
# Run this on your VPS server

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up .env.production file...${NC}"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

cd "$PROJECT_ROOT"

# Check if .env.production already exists
if [ -f ".env.production" ]; then
    echo -e "${YELLOW}Warning: .env.production already exists!${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Aborted. Keeping existing .env.production${NC}"
        exit 0
    fi
    # Backup existing file
    cp .env.production .env.production.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}Backed up existing .env.production${NC}"
fi

# Copy template to .env.production
if [ -f "deploy/env.production.template" ]; then
    cp deploy/env.production.template .env.production
    echo -e "${GREEN}✓ Created .env.production from template${NC}"
else
    echo -e "${RED}✗ Error: deploy/env.production.template not found!${NC}"
    exit 1
fi

# Set proper permissions
chmod 600 .env.production
echo -e "${GREEN}✓ Set secure permissions on .env.production${NC}"

echo ""
echo -e "${GREEN}✓ .env.production file created successfully!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the file: nano .env.production"
echo "2. Update any values if needed (especially STRAPI_API_TOKEN)"
echo "3. Restart PM2 to load environment variables:"
echo "   pm2 restart greenwood-city --update-env"
echo "4. Verify environment variables are loaded:"
echo "   pm2 env 0 | grep STRAPI_URL"
echo ""

