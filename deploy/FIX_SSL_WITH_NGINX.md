# Fix: SSL Certificate with Nginx Running

## Problem
- Port 80 is already in use by Nginx
- Can't use `--standalone` mode
- Need to use `--nginx` mode instead
- But getting 500 error because app isn't responding

## Solution: Fix App First, Then Use --nginx Mode

### Step 1: Cancel Current Certbot Process
Press `C` to cancel the current certbot process.

### Step 2: Fix the Application

```bash
# Check if app is running
pm2 status

# If not running, start it
cd /var/www/greenwood-city
pm2 start ecosystem.config.js
pm2 save

# Check if it's listening
netstat -tulpn | grep 3000

# Test locally
curl http://localhost:3000
```

### Step 3: Check Nginx Configuration

```bash
# Verify Nginx config
nginx -t

# Check if site is enabled
ls -la /etc/nginx/sites-enabled/

# Check Nginx error logs
tail -20 /var/log/nginx/error.log
```

### Step 4: Ensure Nginx Can Proxy to App

Make sure `/etc/nginx/sites-available/greenwood-city` has:

```nginx
server {
    listen 80;
    server_name greenwoodscity.in www.greenwoodscity.in;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

Reload Nginx:
```bash
nginx -t && systemctl reload nginx
```

### Step 5: Test App is Accessible

```bash
# Test locally
curl http://localhost:3000

# Test via domain (should work if DNS is set)
curl http://greenwoodscity.in
```

If both work, proceed to SSL.

### Step 6: Get SSL Certificate with --nginx Mode

```bash
certbot --nginx -d greenwoodscity.in -d www.greenwoodscity.in
```

This will:
- ✅ Keep Nginx running
- ✅ Automatically configure SSL
- ✅ Set up HTTP to HTTPS redirect
- ✅ Configure both domains

## Alternative: If App Still Has Issues

If the app still has 500 errors, you can temporarily configure Nginx to serve a simple response for the ACME challenge:

### Option A: Temporary Nginx Config for ACME

```bash
# Backup current config
cp /etc/nginx/sites-available/greenwood-city /etc/nginx/sites-available/greenwood-city.backup

# Create temporary config that allows ACME challenge
cat > /etc/nginx/sites-available/greenwood-city << 'EOF'
server {
    listen 80;
    server_name greenwoodscity.in www.greenwoodscity.in;

    # Allow ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files $uri =404;
    }

    # Proxy everything else to app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
EOF

nginx -t && systemctl reload nginx

# Now try SSL
certbot --nginx -d greenwoodscity.in -d www.greenwoodscity.in
```

## Troubleshooting

### If App is Not Running

```bash
cd /var/www/greenwood-city

# Check if build exists
ls -la .next/

# If not, rebuild
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save

# Check status
pm2 status
pm2 logs greenwood-city
```

### If Port 3000 is Not Listening

```bash
# Check what's using port 3000
lsof -i :3000

# Or
netstat -tulpn | grep 3000

# If nothing, check PM2
pm2 status
pm2 restart greenwood-city
```

### If Nginx Can't Connect to App

```bash
# Check Nginx error log
tail -f /var/log/nginx/error.log

# Common errors:
# - "Connection refused" = App not running
# - "No route to host" = Firewall issue
# - "Connection timed out" = App crashed
```

## Complete Fix Script

Run this to fix everything:

```bash
#!/bin/bash

# 1. Check and start app
cd /var/www/greenwood-city
pm2 start ecosystem.config.js || pm2 restart greenwood-city
pm2 save

# 2. Wait a moment
sleep 2

# 3. Test app
if curl -s http://localhost:3000 > /dev/null; then
    echo "✓ App is responding on port 3000"
else
    echo "✗ App is not responding. Check logs:"
    pm2 logs greenwood-city --lines 20
    exit 1
fi

# 4. Test Nginx
nginx -t && systemctl reload nginx

# 5. Test domain
if curl -s http://greenwoodscity.in > /dev/null; then
    echo "✓ Domain is accessible"
else
    echo "⚠ Domain not accessible (may be DNS issue)"
fi

# 6. Get SSL
echo "Getting SSL certificate..."
certbot --nginx -d greenwoodscity.in -d www.greenwoodscity.in
```

## After SSL is Installed

Certbot will automatically:
- ✅ Configure HTTPS on port 443
- ✅ Redirect HTTP to HTTPS
- ✅ Set up SSL for both domains
- ✅ Auto-renewal configured

Test it:
```bash
curl https://greenwoodscity.in
```

Visit in browser: `https://greenwoodscity.in`

