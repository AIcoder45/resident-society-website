#!/bin/bash

# Quick Log Checker Script for Greenwood City VPS
# Run this script on your VPS to quickly check all logs

echo "=========================================="
echo "  Greenwood City - Log Checker"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ PM2 is not installed${NC}"
    exit 1
fi

# Check if app is running
echo -e "${GREEN}=== PM2 Status ===${NC}"
pm2 status
echo ""

# Check recent PM2 logs
echo -e "${GREEN}=== Recent PM2 Logs (Last 30 lines) ===${NC}"
pm2 logs greenwood-city --lines 30 --nostream 2>/dev/null || echo "No logs found or app not running"
echo ""

# Check for errors in PM2 logs
echo -e "${YELLOW}=== Recent Errors in PM2 Logs ===${NC}"
pm2 logs greenwood-city --err --lines 50 --nostream 2>/dev/null | tail -20 || echo "No errors found"
echo ""

# Check Nginx error log
echo -e "${GREEN}=== Recent Nginx Errors (Last 20 lines) ===${NC}"
if [ -f /var/log/nginx/error.log ]; then
    tail -n 20 /var/log/nginx/error.log
else
    echo "Nginx error log not found"
fi
echo ""

# Check Nginx access log for errors
echo -e "${YELLOW}=== Recent Failed Requests (4xx, 5xx) ===${NC}"
if [ -f /var/log/nginx/access.log ]; then
    tail -n 100 /var/log/nginx/access.log | grep -E " [45][0-9]{2} " | tail -10 || echo "No failed requests found"
else
    echo "Nginx access log not found"
fi
echo ""

# Check system resources
echo -e "${GREEN}=== System Resources ===${NC}"
echo "Memory:"
free -h | head -2
echo ""
echo "Disk Space:"
df -h | grep -E "Filesystem|/var/www|/$"
echo ""

# Check if app is listening on port 3000
echo -e "${GREEN}=== Port Status ===${NC}"
if command -v netstat &> /dev/null; then
    netstat -tulpn | grep -E "3000|80|443" || echo "No processes found on ports 3000, 80, or 443"
elif command -v ss &> /dev/null; then
    ss -tulpn | grep -E "3000|80|443" || echo "No processes found on ports 3000, 80, or 443"
else
    echo "netstat/ss not available"
fi
echo ""

# Check PM2 log files directly
echo -e "${GREEN}=== PM2 Log Files ===${NC}"
if [ -f /var/www/greenwood-city/logs/pm2-error.log ]; then
    echo "Error log size: $(du -h /var/www/greenwood-city/logs/pm2-error.log | cut -f1)"
    echo "Last 5 error log lines:"
    tail -n 5 /var/www/greenwood-city/logs/pm2-error.log
else
    echo "PM2 error log file not found at /var/www/greenwood-city/logs/pm2-error.log"
fi
echo ""

if [ -f /var/www/greenwood-city/logs/pm2-out.log ]; then
    echo "Output log size: $(du -h /var/www/greenwood-city/logs/pm2-out.log | cut -f1)"
    echo "Last 5 output log lines:"
    tail -n 5 /var/www/greenwood-city/logs/pm2-out.log
else
    echo "PM2 output log file not found at /var/www/greenwood-city/logs/pm2-out.log"
fi
echo ""

# Check for Strapi-related errors
echo -e "${YELLOW}=== Strapi Connection Status ===${NC}"
pm2 logs greenwood-city --lines 100 --nostream 2>/dev/null | grep -i "strapi" | tail -10 || echo "No Strapi-related logs found"
echo ""

# Summary
echo -e "${GREEN}=========================================="
echo "  Summary"
echo "==========================================${NC}"
echo ""
echo "To view logs in real-time, run:"
echo "  pm2 logs greenwood-city --follow"
echo ""
echo "To view only errors, run:"
echo "  pm2 logs greenwood-city --err --lines 100"
echo ""
echo "To view Nginx errors, run:"
echo "  tail -f /var/log/nginx/error.log"
echo ""
echo "For more detailed log checking, see:"
echo "  deploy/CHECK_LOGS_GUIDE.md"
echo ""

