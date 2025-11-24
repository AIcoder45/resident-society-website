#!/bin/bash

# Comprehensive Diagnostic Script for Greenwood City VPS
# Run this to diagnose both Strapi 502 errors and missing images

echo "=========================================="
echo "  Greenwood City - Issue Diagnostic"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check 1: PM2 Status
echo -e "${BLUE}=== 1. Application Status ===${NC}"
pm2 status
echo ""

# Check 2: Recent Errors
echo -e "${BLUE}=== 2. Recent Errors (Last 50 lines) ===${NC}"
pm2 logs greenwood-city --err --lines 50 --nostream 2>/dev/null | tail -30 || echo "No errors found"
echo ""

# Check 3: Strapi Connection Test
echo -e "${BLUE}=== 3. Strapi Connection Test ===${NC}"
STRAPI_URL=$(grep STRAPI_URL /var/www/greenwood-city/.env.production 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'")
if [ -z "$STRAPI_URL" ]; then
    echo -e "${YELLOW}⚠️  STRAPI_URL not found in .env.production${NC}"
else
    echo "Testing connection to: $STRAPI_URL"
    echo ""
    
    # Test API endpoint
    if command -v curl &> /dev/null; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$STRAPI_URL/api/events" 2>/dev/null)
        if [ "$HTTP_CODE" = "200" ]; then
            echo -e "${GREEN}✅ Strapi is responding (HTTP $HTTP_CODE)${NC}"
        elif [ "$HTTP_CODE" = "502" ]; then
            echo -e "${RED}❌ Strapi returned 502 Bad Gateway${NC}"
            echo "   This means Strapi server is not running or not accessible"
            echo "   See: deploy/FIX_502_STRAPI_ERROR.md"
        elif [ "$HTTP_CODE" = "000" ]; then
            echo -e "${RED}❌ Cannot connect to Strapi (timeout or DNS error)${NC}"
        else
            echo -e "${YELLOW}⚠️  Strapi returned HTTP $HTTP_CODE${NC}"
        fi
    else
        echo "curl not available, skipping connection test"
    fi
fi
echo ""

# Check 4: Missing Gallery Images
echo -e "${BLUE}=== 4. Gallery Images Check ===${NC}"
cd /var/www/greenwood-city

if [ -f "src/data/gallery.json" ]; then
    # Extract image paths from JSON
    grep -o '"/images/gallery/[^"]*"' src/data/gallery.json 2>/dev/null | sed 's/"//g' | sort -u > /tmp/required-images.txt 2>/dev/null
    
    if [ -s /tmp/required-images.txt ]; then
        missing=0
        found=0
        while IFS= read -r image; do
            if [ -f "public$image" ]; then
                found=$((found + 1))
            else
                echo -e "${RED}❌ Missing: public$image${NC}"
                missing=$((missing + 1))
            fi
        done < /tmp/required-images.txt
        
        echo ""
        echo -e "Found: ${GREEN}$found${NC} images"
        echo -e "Missing: ${RED}$missing${NC} images"
        
        if [ $missing -gt 0 ]; then
            echo ""
            echo -e "${YELLOW}💡 Fix: See deploy/FIX_MISSING_GALLERY_IMAGES.md${NC}"
        fi
        
        rm -f /tmp/required-images.txt
    else
        echo "No gallery images found in JSON file"
    fi
else
    echo "gallery.json not found"
fi
echo ""

# Check 5: Gallery Directory
echo -e "${BLUE}=== 5. Gallery Directory Status ===${NC}"
if [ -d "public/images/gallery" ]; then
    IMAGE_COUNT=$(find public/images/gallery -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" \) 2>/dev/null | wc -l)
    echo -e "Gallery directory exists with ${GREEN}$IMAGE_COUNT${NC} image files"
    ls -lh public/images/gallery/*.{jpg,jpeg,png,webp} 2>/dev/null | head -10 || echo "No images found in gallery directory"
else
    echo -e "${YELLOW}⚠️  Gallery directory does not exist: public/images/gallery${NC}"
    echo "   Creating directory..."
    mkdir -p public/images/gallery
    chown -R www-data:www-data public/images/gallery
    echo "   Directory created"
fi
echo ""

# Check 6: System Resources
echo -e "${BLUE}=== 6. System Resources ===${NC}"
echo "Memory:"
free -h | head -2
echo ""
echo "Disk Space:"
df -h | grep -E "Filesystem|/var/www|/$"
echo ""

# Check 7: Port Status
echo -e "${BLUE}=== 7. Port Status ===${NC}"
if command -v netstat &> /dev/null; then
    netstat -tulpn | grep -E "3000|80|443" || echo "No processes found on ports 3000, 80, or 443"
elif command -v ss &> /dev/null; then
    ss -tulpn | grep -E "3000|80|443" || echo "No processes found on ports 3000, 80, or 443"
fi
echo ""

# Check 8: Nginx Status
echo -e "${BLUE}=== 8. Nginx Status ===${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
    echo "Recent errors:"
    tail -n 5 /var/log/nginx/error.log 2>/dev/null || echo "No errors"
else
    echo -e "${RED}❌ Nginx is not running${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}=========================================="
echo "  Summary & Next Steps"
echo "==========================================${NC}"
echo ""
echo "Issues Found:"
echo ""

# Check for Strapi 502 errors in logs
if pm2 logs greenwood-city --lines 100 --nostream 2>/dev/null | grep -q "502 Bad Gateway"; then
    echo -e "${RED}❌ Strapi 502 Bad Gateway errors detected${NC}"
    echo "   → See: deploy/FIX_502_STRAPI_ERROR.md"
    echo ""
fi

# Check for missing images
if [ -f /tmp/required-images.txt ] && [ -s /tmp/required-images.txt ]; then
    MISSING_COUNT=$(grep -v "^$" /tmp/required-images.txt | while read img; do [ ! -f "public$img" ] && echo 1; done | wc -l)
    if [ "$MISSING_COUNT" -gt 0 ]; then
        echo -e "${RED}❌ Missing gallery images detected${NC}"
        echo "   → See: deploy/FIX_MISSING_GALLERY_IMAGES.md"
        echo ""
    fi
fi

echo "Useful Commands:"
echo "  pm2 logs greenwood-city --follow          # View live logs"
echo "  pm2 logs greenwood-city --err --lines 100 # View errors only"
echo "  pm2 restart greenwood-city                # Restart application"
echo ""
echo "Documentation:"
echo "  deploy/CHECK_LOGS_GUIDE.md                # Complete log guide"
echo "  deploy/FIX_502_STRAPI_ERROR.md             # Fix Strapi 502 errors"
echo "  deploy/FIX_MISSING_GALLERY_IMAGES.md       # Fix missing images"
echo ""

