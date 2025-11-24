# Remove Greenwood City Application from VPS

Guide to safely remove the `greenwood-city` PM2 process and optionally delete application files.

---

## Option 1: Remove PM2 Process Only (Keep Files)

**This stops and removes the PM2 process but keeps the application files.**

### Step 1: Connect to VPS
```bash
ssh root@31.97.232.51
```

### Step 2: Stop and Delete PM2 Process
```bash
# Stop the process
pm2 stop greenwood-city

# Delete the process from PM2
pm2 delete greenwood-city

# Save PM2 configuration (removes from startup)
pm2 save

# Verify it's removed
pm2 status
```

**Result:** The app is stopped and removed from PM2, but files remain at `/var/www/greenwood-city`

---

## Option 2: Remove PM2 Process + Application Files

**This completely removes everything including application files.**

### Step 1: Connect to VPS
```bash
ssh root@31.97.232.51
```

### Step 2: Stop and Delete PM2 Process
```bash
# Stop the process
pm2 stop greenwood-city

# Delete the process from PM2
pm2 delete greenwood-city

# Save PM2 configuration
pm2 save

# Verify it's removed
pm2 status
```

### Step 3: Remove Application Files
```bash
# Remove the entire application directory
rm -rf /var/www/greenwood-city

# Verify it's removed
ls -la /var/www/
```

### Step 4: (Optional) Remove Nginx Configuration
```bash
# Remove Nginx site configuration
rm -f /etc/nginx/sites-available/greenwood-city
rm -f /etc/nginx/sites-enabled/greenwood-city

# Test and reload Nginx
nginx -t
systemctl reload nginx
```

### Step 5: (Optional) Remove Logs
```bash
# Remove PM2 logs (if they exist separately)
rm -rf ~/.pm2/logs/greenwood-city*

# Remove application logs
rm -rf /var/www/greenwood-city/logs
```

---

## Option 3: Complete Removal Script

**Run this script for complete removal:**

```bash
#!/bin/bash
# Complete removal script for greenwood-city

echo "Removing greenwood-city application..."

# Stop and delete PM2 process
echo "1. Stopping PM2 process..."
pm2 stop greenwood-city 2>/dev/null
pm2 delete greenwood-city 2>/dev/null
pm2 save

# Remove application files
echo "2. Removing application files..."
rm -rf /var/www/greenwood-city

# Remove Nginx configuration
echo "3. Removing Nginx configuration..."
rm -f /etc/nginx/sites-available/greenwood-city
rm -f /etc/nginx/sites-enabled/greenwood-city

# Reload Nginx
echo "4. Reloading Nginx..."
nginx -t && systemctl reload nginx

# Remove PM2 logs
echo "5. Cleaning up PM2 logs..."
rm -rf ~/.pm2/logs/greenwood-city*

echo ""
echo "✅ Removal complete!"
echo ""
echo "Remaining PM2 processes:"
pm2 status
```

**To use the script:**
```bash
# Save the script
nano /tmp/remove-greenwood.sh
# Paste the script above, save (Ctrl+X, Y, Enter)

# Make executable and run
chmod +x /tmp/remove-greenwood.sh
/tmp/remove-greenwood.sh
```

---

## Quick Commands (Copy-Paste Ready)

### Remove PM2 Process Only
```bash
pm2 stop greenwood-city && pm2 delete greenwood-city && pm2 save && pm2 status
```

### Remove Everything
```bash
pm2 stop greenwood-city && pm2 delete greenwood-city && pm2 save && \
rm -rf /var/www/greenwood-city && \
rm -f /etc/nginx/sites-available/greenwood-city && \
rm -f /etc/nginx/sites-enabled/greenwood-city && \
nginx -t && systemctl reload nginx && \
pm2 status
```

---

## Verification

After removal, verify:

```bash
# Check PM2 processes
pm2 status
# Should not show greenwood-city

# Check if directory exists
ls -la /var/www/greenwood-city
# Should show "No such file or directory"

# Check Nginx configs
ls -la /etc/nginx/sites-enabled/ | grep greenwood
# Should show nothing

# Check if port 3000 is free
netstat -tulpn | grep 3000
# Should show nothing
```

---

## Important Notes

⚠️ **Before removing:**

1. **Backup if needed:**
   ```bash
   # Backup application files
   tar -czf greenwood-city-backup-$(date +%Y%m%d).tar.gz /var/www/greenwood-city
   
   # Backup environment file
   cp /var/www/greenwood-city/.env.production ~/greenwood-env-backup.txt
   ```

2. **Check if anything else depends on it:**
   - Other services using the same database?
   - Scheduled tasks?
   - Monitoring systems?

3. **Remove Nginx config only if you're not using the domain anymore**

---

## Restore (If Needed)

If you need to restore:

```bash
# Restore from backup
tar -xzf greenwood-city-backup-YYYYMMDD.tar.gz -C /

# Restore PM2 process
cd /var/www/greenwood-city
pm2 start ecosystem.config.js
pm2 save

# Restore Nginx config (if you have it)
# Copy your nginx config back to /etc/nginx/sites-available/
```

---

## Summary

**To remove PM2 process only:**
```bash
pm2 stop greenwood-city && pm2 delete greenwood-city && pm2 save
```

**To remove everything:**
```bash
pm2 stop greenwood-city && pm2 delete greenwood-city && pm2 save && \
rm -rf /var/www/greenwood-city
```

**Verify removal:**
```bash
pm2 status
ls -la /var/www/greenwood-city
```

