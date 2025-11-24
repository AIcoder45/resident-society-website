# How to Check Logs on VPS (Hostinger)

Complete guide for checking application logs to diagnose issues on your deployed application.

---

## Quick Start - Check Logs Now

### Connect to Your VPS
```bash
ssh root@31.97.232.51
```

### View All Logs (Recommended First Step)
```bash
# View real-time logs (most recent at bottom)
pm2 logs greenwood-city --lines 100

# Follow logs in real-time (press Ctrl+C to exit)
pm2 logs greenwood-city --follow
```

---

## 1. PM2 Application Logs

PM2 manages your Next.js application and logs all output.

### View All PM2 Logs
```bash
# View last 50 lines (default)
pm2 logs greenwood-city

# View last 100 lines
pm2 logs greenwood-city --lines 100

# View last 500 lines
pm2 logs greenwood-city --lines 500

# Follow logs in real-time (live updates)
pm2 logs greenwood-city --follow
```

### View Specific Log Types
```bash
# View only errors
pm2 logs greenwood-city --err --lines 100

# View only standard output
pm2 logs greenwood-city --out --lines 100

# View errors from last 24 hours
pm2 logs greenwood-city --err --lines 1000 | grep "$(date +%Y-%m-%d)"
```

### Filter Logs by Content
```bash
# View only errors (look for ❌ emoji)
pm2 logs greenwood-city --lines 200 | grep "❌"

# View Strapi-related logs
pm2 logs greenwood-city --lines 200 | grep -i "strapi"

# View warnings
pm2 logs greenwood-city --lines 200 | grep "⚠️"

# View successful operations
pm2 logs greenwood-city --lines 200 | grep "✅"

# View Next.js build errors
pm2 logs greenwood-city --lines 200 | grep -i "error"

# View API route errors
pm2 logs greenwood-city --lines 200 | grep -i "api"
```

### Check PM2 Log Files Directly
```bash
# View error log file
tail -f /var/www/greenwood-city/logs/pm2-error.log

# View output log file
tail -f /var/www/greenwood-city/logs/pm2-out.log

# View last 100 lines of error log
tail -n 100 /var/www/greenwood-city/logs/pm2-error.log

# Search error log for specific text
grep -i "error" /var/www/greenwood-city/logs/pm2-error.log | tail -50
```

---

## 2. Nginx Web Server Logs

Nginx handles incoming HTTP requests and can show connection issues.

### View Nginx Error Logs
```bash
# View error log in real-time
tail -f /var/log/nginx/error.log

# View last 100 error lines
tail -n 100 /var/log/nginx/error.log

# Search for specific errors
grep -i "502\|503\|504\|500" /var/log/nginx/error.log | tail -50

# View errors from today
grep "$(date +%Y/%m/%d)" /var/log/nginx/error.log
```

### View Nginx Access Logs
```bash
# View access log in real-time
tail -f /var/log/nginx/access.log

# View last 100 access entries
tail -n 100 /var/log/nginx/access.log

# View only failed requests (4xx, 5xx)
tail -n 1000 /var/log/nginx/access.log | grep -E " [45][0-9]{2} "

# View requests to specific endpoint
grep "/api/" /var/log/nginx/access.log | tail -50
```

### Check Nginx Status
```bash
# Check if Nginx is running
systemctl status nginx

# Test Nginx configuration
nginx -t

# View Nginx configuration
cat /etc/nginx/sites-available/greenwood-city
```

---

## 3. System Logs

System-level logs can show server issues.

### View System Logs
```bash
# View system journal (recent logs)
journalctl -n 100

# View system errors
journalctl -p err -n 50

# View logs for specific service
journalctl -u nginx -n 50
journalctl -u pm2-root -n 50

# View logs from last hour
journalctl --since "1 hour ago"

# View logs from today
journalctl --since today
```

### Check System Resources
```bash
# Check memory usage
free -h

# Check disk space
df -h

# Check CPU usage
top
# or
htop

# Check running processes
ps aux | grep node
ps aux | grep nginx
```

---

## 4. Application-Specific Logs

### Check Next.js Build Logs
```bash
# View build output (if build failed)
cd /var/www/greenwood-city
cat .next/trace

# Check if build directory exists
ls -la /var/www/greenwood-city/.next
```

### Check Environment Variables
```bash
# View production environment file
cat /var/www/greenwood-city/.env.production

# Check what PM2 sees
pm2 show greenwood-city | grep -A 20 "env:"
```

### Check Application Status
```bash
# Check PM2 status
pm2 status

# Get detailed info about app
pm2 show greenwood-city

# Check if app is listening on port 3000
netstat -tulpn | grep 3000
# or
ss -tulpn | grep 3000

# Test if app responds locally
curl http://localhost:3000
```

---

## 5. Common Issues and How to Check Logs

### Issue: Application Not Starting

**Check these logs:**
```bash
# 1. Check PM2 error logs
pm2 logs greenwood-city --err --lines 100

# 2. Check if port is in use
netstat -tulpn | grep 3000

# 3. Check environment variables
pm2 show greenwood-city | grep env

# 4. Check build directory
ls -la /var/www/greenwood-city/.next
```

### Issue: 502 Bad Gateway Error

**Check these logs:**
```bash
# 1. Check if app is running
pm2 status

# 2. Check Nginx error log
tail -n 50 /var/log/nginx/error.log

# 3. Check if app responds locally
curl http://localhost:3000

# 4. Check PM2 logs for startup errors
pm2 logs greenwood-city --err --lines 100
```

### Issue: 500 Internal Server Error

**Check these logs:**
```bash
# 1. Check PM2 error logs (most important)
pm2 logs greenwood-city --err --lines 200

# 2. Check Nginx error log
tail -n 50 /var/log/nginx/error.log

# 3. Check for runtime errors
pm2 logs greenwood-city --lines 200 | grep -i "error\|exception\|failed"
```

### Issue: Strapi Connection Errors

**Check these logs:**
```bash
# 1. View Strapi-related logs
pm2 logs greenwood-city --lines 200 | grep -i "strapi"

# 2. View all errors
pm2 logs greenwood-city --lines 200 | grep "❌"

# 3. Check environment variables
cat /var/www/greenwood-city/.env.production | grep STRAPI

# 4. Test Strapi connection
curl https://admin.greenwoodscity.in/api/news-articles
```

### Issue: API Routes Not Working

**Check these logs:**
```bash
# 1. Check PM2 logs for API errors
pm2 logs greenwood-city --lines 200 | grep -i "api"

# 2. Check Nginx access log for API requests
tail -n 100 /var/log/nginx/access.log | grep "/api/"

# 3. Check Nginx error log
tail -n 50 /var/log/nginx/error.log
```

### Issue: Out of Memory

**Check these logs:**
```bash
# 1. Check memory usage
free -h
pm2 monit

# 2. Check PM2 memory logs
pm2 logs greenwood-city --lines 200 | grep -i "memory\|out of memory"

# 3. Check system logs
journalctl -p err -n 50 | grep -i "memory\|oom"
```

---

## 6. Advanced Log Analysis

### Save Logs to File
```bash
# Save PM2 logs to file
pm2 logs greenwood-city --lines 500 > /tmp/app-logs.txt

# Save Nginx error log
tail -n 500 /var/log/nginx/error.log > /tmp/nginx-errors.txt

# Save all relevant logs
{
  echo "=== PM2 Logs ==="
  pm2 logs greenwood-city --lines 200 --nostream
  echo ""
  echo "=== Nginx Error Log ==="
  tail -n 100 /var/log/nginx/error.log
  echo ""
  echo "=== System Status ==="
  pm2 status
  free -h
} > /tmp/all-logs-$(date +%Y%m%d-%H%M%S).txt
```

### Search Across Multiple Log Files
```bash
# Search for error in all log files
grep -r "error" /var/www/greenwood-city/logs/ /var/log/nginx/

# Search for specific timestamp
grep "2024-01-15" /var/www/greenwood-city/logs/pm2-error.log

# Count errors
grep -c "error" /var/www/greenwood-city/logs/pm2-error.log
```

### Monitor Logs in Real-Time
```bash
# Monitor PM2 logs
pm2 logs greenwood-city --follow

# Monitor multiple logs simultaneously (in separate terminals)
# Terminal 1:
pm2 logs greenwood-city --follow

# Terminal 2:
tail -f /var/log/nginx/error.log

# Terminal 3:
tail -f /var/log/nginx/access.log
```

---

## 7. Quick Diagnostic Commands

Run these commands to get a complete picture:

```bash
# Complete status check
echo "=== PM2 Status ==="
pm2 status
echo ""
echo "=== Recent PM2 Logs (Last 50 lines) ==="
pm2 logs greenwood-city --lines 50 --nostream
echo ""
echo "=== Recent Nginx Errors (Last 20 lines) ==="
tail -n 20 /var/log/nginx/error.log
echo ""
echo "=== System Resources ==="
free -h
df -h | grep -E "Filesystem|/var/www"
echo ""
echo "=== Port Status ==="
netstat -tulpn | grep -E "3000|80|443"
```

---

## 8. Log File Locations Summary

| Log Type | Location |
|----------|----------|
| PM2 Error Log | `/var/www/greenwood-city/logs/pm2-error.log` |
| PM2 Output Log | `/var/www/greenwood-city/logs/pm2-out.log` |
| Nginx Error Log | `/var/log/nginx/error.log` |
| Nginx Access Log | `/var/log/nginx/access.log` |
| System Journal | `journalctl` (use commands above) |
| Next.js Build Log | `/var/www/greenwood-city/.next/trace` |

---

## 9. Useful PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs greenwood-city

# Restart app
pm2 restart greenwood-city

# Stop app
pm2 stop greenwood-city

# Start app
pm2 start greenwood-city

# Delete app from PM2
pm2 delete greenwood-city

# Reload app (zero downtime)
pm2 reload greenwood-city

# Show detailed info
pm2 show greenwood-city

# Monitor resources
pm2 monit

# Save PM2 configuration
pm2 save

# View PM2 startup script
pm2 startup
```

---

## 10. Troubleshooting Steps

When you encounter an issue, follow these steps:

1. **Check PM2 Status**
   ```bash
   pm2 status
   ```

2. **View Recent Logs**
   ```bash
   pm2 logs greenwood-city --lines 100
   ```

3. **Check for Errors**
   ```bash
   pm2 logs greenwood-city --err --lines 100
   ```

4. **Check Nginx Logs**
   ```bash
   tail -n 50 /var/log/nginx/error.log
   ```

5. **Verify Application is Running**
   ```bash
   curl http://localhost:3000
   ```

6. **Check System Resources**
   ```bash
   free -h
   df -h
   ```

7. **Review Environment Variables**
   ```bash
   pm2 show greenwood-city | grep env
   ```

---

## Quick Reference Card

```bash
# Most Common Commands
pm2 logs greenwood-city --lines 100          # View recent logs
pm2 logs greenwood-city --follow              # Follow logs live
pm2 logs greenwood-city --err --lines 100    # View errors only
tail -f /var/log/nginx/error.log             # Nginx errors
pm2 status                                    # Check app status
pm2 restart greenwood-city                    # Restart app
```

---

## Need Help?

If you're still unable to find the issue:

1. **Save all logs:**
   ```bash
   pm2 logs greenwood-city --lines 500 > /tmp/pm2-logs.txt
   tail -n 200 /var/log/nginx/error.log > /tmp/nginx-errors.txt
   ```

2. **Check application status:**
   ```bash
   pm2 status > /tmp/pm2-status.txt
   pm2 show greenwood-city > /tmp/pm2-info.txt
   ```

3. **Review the saved files** or share them for troubleshooting.

---

**Remember:** Most issues will show up in `pm2 logs greenwood-city --lines 100`. Start there first!

