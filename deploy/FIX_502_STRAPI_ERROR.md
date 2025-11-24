# Fix 502 Bad Gateway Error for Strapi

## Problem

Your Next.js application is getting **502 Bad Gateway** errors when trying to connect to Strapi at `https://admin.greenwoodscity.in`.

```
❌ [Strapi] Fetch Error: {
  error: 'Strapi API error: 502 Bad Gateway',
  url: 'https://admin.greenwoodscity.in/api/events?populate=*&sort[0]=eventDate:asc&pagination[pageSize]=100',
  ...
}
```

## What 502 Bad Gateway Means

A **502 Bad Gateway** error means:
- Your Next.js app (on the VPS) is trying to reach Strapi
- The request reaches the Strapi server's Nginx/web server
- But Nginx cannot connect to the Strapi application itself
- This usually means **Strapi is not running** or **not accessible**

---

## Step-by-Step Diagnosis

### Step 1: Check if Strapi Server is Running

**On your Strapi server** (where Strapi is hosted):

```bash
# Check if Strapi process is running
pm2 status

# Or check for Node processes
ps aux | grep node | grep strapi

# Check if Strapi is listening on a port
netstat -tulpn | grep 1337
# or
ss -tulpn | grep 1337
```

**If Strapi is not running:**
```bash
# Navigate to Strapi directory
cd /path/to/your/strapi/app

# Start Strapi with PM2
pm2 start ecosystem.config.js
# or
pm2 start npm --name strapi -- start

# Save PM2 configuration
pm2 save
```

### Step 2: Test Strapi Directly

**On your Strapi server:**

```bash
# Test if Strapi responds locally
curl http://localhost:1337/api/events

# Test with the domain
curl https://admin.greenwoodscity.in/api/events
```

**If localhost works but domain doesn't:**
- Nginx configuration issue (see Step 3)
- SSL certificate issue
- Firewall blocking

### Step 3: Check Nginx Configuration on Strapi Server

**On your Strapi server:**

```bash
# View Nginx configuration
cat /etc/nginx/sites-available/admin.greenwoodscity.in
# or
cat /etc/nginx/sites-available/default

# Test Nginx configuration
nginx -t

# Check Nginx error log
tail -n 50 /var/log/nginx/error.log
```

**Common Nginx issues:**

1. **Wrong upstream port:**
   ```nginx
   # Should point to where Strapi is running (usually 1337)
   upstream strapi {
       server 127.0.0.1:1337;
   }
   ```

2. **Strapi not running on expected port:**
   - Check Strapi's `.env` file for `PORT` variable
   - Ensure Nginx upstream matches

3. **Nginx can't connect to Strapi:**
   ```bash
   # Check if Strapi is listening on correct interface
   netstat -tulpn | grep 1337
   # Should show: 127.0.0.1:1337 or 0.0.0.0:1337
   ```

### Step 4: Check Strapi Logs

**On your Strapi server:**

```bash
# If using PM2
pm2 logs strapi --lines 100

# Check Strapi error logs
tail -n 100 /path/to/strapi/logs/error.log

# Check Strapi output
tail -n 100 /path/to/strapi/logs/output.log
```

**Look for:**
- Database connection errors
- Port already in use errors
- Memory errors
- Startup failures

### Step 5: Check from Next.js Server

**On your Next.js VPS** (where the app is deployed):

```bash
# Test connection to Strapi from Next.js server
curl -v https://admin.greenwoodscity.in/api/events

# Check DNS resolution
nslookup admin.greenwoodscity.in

# Test with timeout
curl --max-time 10 https://admin.greenwoodscity.in/api/events
```

**If curl fails:**
- Network connectivity issue
- DNS resolution problem
- Firewall blocking connection
- SSL certificate issue

---

## Common Solutions

### Solution 1: Restart Strapi

**On Strapi server:**

```bash
# Restart Strapi
pm2 restart strapi

# Or if not using PM2
cd /path/to/strapi
npm run start
```

### Solution 2: Check Strapi Port Configuration

**On Strapi server:**

```bash
# Check Strapi .env file
cat .env | grep PORT

# Should show something like:
# PORT=1337
# HOST=0.0.0.0
```

**If PORT is different, update Nginx upstream configuration.**

### Solution 3: Fix Nginx Upstream Configuration

**On Strapi server:**

```bash
# Edit Nginx config
nano /etc/nginx/sites-available/admin.greenwoodscity.in
```

**Ensure upstream is correct:**

```nginx
upstream strapi {
    server 127.0.0.1:1337;
    # Add backup server if needed
    # server 127.0.0.1:1338 backup;
}

server {
    listen 80;
    listen [::]:80;
    server_name admin.greenwoodscity.in;

    location / {
        proxy_pass http://strapi;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Then reload Nginx:**

```bash
nginx -t
systemctl reload nginx
```

### Solution 4: Check Firewall

**On Strapi server:**

```bash
# Check firewall status
ufw status

# Allow Strapi port (if needed for external access)
ufw allow 1337/tcp

# Allow Nginx ports
ufw allow 80/tcp
ufw allow 443/tcp
```

### Solution 5: Check Database Connection

**On Strapi server:**

```bash
# Check Strapi .env for database config
cat .env | grep DATABASE

# Test database connection
# (depends on your database type)
```

**If database is down, Strapi won't start properly.**

### Solution 6: Increase Memory/Resources

**If Strapi keeps crashing:**

```bash
# Check memory usage
free -h

# Check Strapi memory limits in PM2
pm2 show strapi | grep memory

# Increase PM2 memory limit
pm2 restart strapi --max-memory-restart 1G
```

---

## Quick Diagnostic Script

**Run this on your Strapi server:**

```bash
#!/bin/bash
echo "=== Strapi Diagnostic ==="
echo ""
echo "1. PM2 Status:"
pm2 status
echo ""
echo "2. Port Check:"
netstat -tulpn | grep 1337 || echo "Port 1337 not in use"
echo ""
echo "3. Local Test:"
curl -s http://localhost:1337/api/events | head -20 || echo "Strapi not responding locally"
echo ""
echo "4. Domain Test:"
curl -s https://admin.greenwoodscity.in/api/events | head -20 || echo "Domain not responding"
echo ""
echo "5. Nginx Status:"
systemctl status nginx --no-pager | head -10
echo ""
echo "6. Recent Nginx Errors:"
tail -n 10 /var/log/nginx/error.log
```

---

## Temporary Workaround: Disable Strapi

**If Strapi is completely down and you need the site working:**

**On Next.js VPS:**

```bash
# Edit environment file
cd /var/www/greenwood-city
nano .env.production

# Comment out or remove STRAPI_URL
# STRAPI_URL=https://admin.greenwoodscity.in

# Or set to empty
STRAPI_URL=

# Restart app
pm2 restart greenwood-city --update-env
```

**This will make the app use JSON fallback files instead of Strapi.**

---

## Prevention

1. **Set up PM2 auto-restart:**
   ```bash
   pm2 startup
   pm2 save
   ```

2. **Monitor Strapi:**
   ```bash
   pm2 monit
   ```

3. **Set up alerts** for Strapi downtime

4. **Regular backups** of Strapi database

5. **Health check endpoint** to monitor Strapi status

---

## Still Not Working?

1. **Check Strapi server resources:**
   ```bash
   free -h
   df -h
   top
   ```

2. **Review all logs:**
   ```bash
   pm2 logs strapi --lines 500
   tail -n 100 /var/log/nginx/error.log
   journalctl -u nginx -n 50
   ```

3. **Test from different locations:**
   - From Next.js server
   - From your local machine
   - Using online tools (e.g., https://www.uptrends.com/tools/http-status)

4. **Check SSL certificate:**
   ```bash
   certbot certificates
   ```

---

## Summary Checklist

- [ ] Strapi is running (`pm2 status`)
- [ ] Strapi responds locally (`curl http://localhost:1337/api/events`)
- [ ] Nginx configuration is correct
- [ ] Nginx can connect to Strapi upstream
- [ ] Firewall allows connections
- [ ] Database is accessible
- [ ] SSL certificate is valid
- [ ] Sufficient server resources (memory, disk)

---

**Once Strapi is running again, your Next.js app should automatically reconnect!**

