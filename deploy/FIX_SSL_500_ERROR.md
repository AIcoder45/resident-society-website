# Fix: SSL Certificate 500 Error

## Problem
```
Certbot failed to authenticate some domains
Detail: 500 Invalid response from http://greenwoodscity.in/.well-known/acme-challenge/...
```

This means:
- ✅ Nginx is installed and running
- ✅ Domain is pointing to your VPS
- ❌ Next.js app is not responding (500 error)

## Quick Fix Steps

### Step 1: Check if Nginx is Running
```bash
systemctl status nginx
```

If not running:
```bash
systemctl start nginx
systemctl enable nginx
```

### Step 2: Check if Next.js App is Running
```bash
pm2 status
```

If not running:
```bash
cd /var/www/greenwood-city
pm2 start ecosystem.config.js
pm2 save
```

### Step 3: Check App Logs for Errors
```bash
pm2 logs greenwood-city --lines 50
```

Look for errors like:
- Port already in use
- Missing environment variables
- Build errors
- Module not found errors

### Step 4: Test if App is Responding Locally
```bash
curl http://localhost:3000
```

If this fails, the app isn't running properly.

### Step 5: Check Nginx Error Logs
```bash
tail -f /var/log/nginx/error.log
```

This will show what error Nginx is getting when trying to proxy.

### Step 6: Verify Nginx Configuration
```bash
nginx -t
```

Should show: `syntax is ok` and `test is successful`

### Step 7: Check if Port 3000 is in Use
```bash
netstat -tulpn | grep 3000
```

Should show a node process listening on port 3000.

## Common Issues and Solutions

### Issue 1: App Not Started
```bash
cd /var/www/greenwood-city
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

### Issue 2: App Crashed
```bash
# Check logs
pm2 logs greenwood-city --err

# Restart
pm2 restart greenwood-city

# If still failing, check for errors
cd /var/www/greenwood-city
npm run build  # Rebuild if needed
pm2 restart greenwood-city
```

### Issue 3: Port 3000 Not Listening
```bash
# Check what's using port 3000
lsof -i :3000

# Or
netstat -tulpn | grep 3000

# If nothing, restart app
pm2 restart greenwood-city
```

### Issue 4: Missing Environment Variables
```bash
cd /var/www/greenwood-city

# Check if .env.production exists
ls -la .env.production

# If not, create it
cp deploy/env.production.template .env.production
nano .env.production  # Edit with your values

# Restart app
pm2 restart greenwood-city
```

### Issue 5: Build Failed
```bash
cd /var/www/greenwood-city

# Rebuild
npm run build

# If build fails, check errors
npm run build 2>&1 | tee build.log

# Fix errors, then restart
pm2 restart greenwood-city
```

## Temporary Fix: Use Standalone Mode for SSL

If the app isn't working yet, you can get SSL certificate using standalone mode:

```bash
# Stop Nginx temporarily
systemctl stop nginx

# Get certificate in standalone mode
certbot certonly --standalone -d greenwoodscity.in -d www.greenwoodscity.in

# Start Nginx again
systemctl start nginx

# Then manually configure Nginx for SSL (see below)
```

## After Fixing the App, Retry SSL

Once the app is working:

```bash
# Test app is accessible
curl http://localhost:3000
curl http://greenwoodscity.in

# If both work, retry SSL
certbot --nginx -d greenwoodscity.in -d www.greenwoodscity.in
```

## Manual SSL Configuration (if needed)

If you got the certificate using standalone mode, manually configure Nginx:

```bash
nano /etc/nginx/sites-available/greenwood-city
```

Update to:
```nginx
server {
    listen 80;
    server_name greenwoodscity.in www.greenwoodscity.in;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name greenwoodscity.in www.greenwoodscity.in;

    ssl_certificate /etc/letsencrypt/live/greenwoodscity.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/greenwoodscity.in/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

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

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
```

Then:
```bash
nginx -t
systemctl reload nginx
```

## Verification Checklist

Run these commands to verify everything:

```bash
# 1. Nginx running
systemctl status nginx

# 2. App running
pm2 status

# 3. App listening
netstat -tulpn | grep 3000

# 4. App responds locally
curl http://localhost:3000

# 5. App responds via domain
curl http://greenwoodscity.in

# 6. Nginx config valid
nginx -t

# 7. Check Nginx error log
tail -20 /var/log/nginx/error.log
```

Once all these pass, retry SSL certificate.

