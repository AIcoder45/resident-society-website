# Why Connection is Not Secure

## Current Status
Your website `greenwoodscity.in` is showing "Not secure" because:
- ❌ No SSL certificate installed
- ❌ Site is only accessible via HTTP (port 80)
- ❌ HTTPS (port 443) is not configured
- ❌ Browser can't verify the site's identity

## What "Not Secure" Means

When a browser shows "Not secure":
- The connection between browser and server is not encrypted
- Data can be intercepted by attackers
- No SSL/TLS certificate is installed
- Site is using HTTP instead of HTTPS

## Solution: Install SSL Certificate

You need to complete the SSL certificate installation that was interrupted earlier.

### Step 1: Verify App is Running (Single Instance)

```bash
# Check PM2 status (should show only 1 greenwood-city)
pm2 status

# Test app responds
curl http://localhost:3000
curl http://greenwoodscity.in
```

### Step 2: Verify Nginx is Configured

```bash
# Check Nginx is running
systemctl status nginx

# Check configuration
nginx -t

# Check if site is enabled
ls -la /etc/nginx/sites-enabled/greenwood-city
```

### Step 3: Get SSL Certificate

```bash
# Install Certbot if not installed
apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate (this will configure HTTPS automatically)
certbot --nginx -d greenwoodscity.in -d www.greenwoodscity.in
```

**During the process, Certbot will ask:**
1. Email address (for renewal notices)
2. Agree to terms
3. Redirect HTTP to HTTPS? → **Choose Yes** (recommended)

### Step 4: Verify SSL is Working

After SSL is installed:

```bash
# Test HTTPS
curl https://greenwoodscity.in

# Check certificate
openssl s_client -connect greenwoodscity.in:443 -servername greenwoodscity.in
```

### Step 5: Test in Browser

Visit: `https://greenwoodscity.in`

You should see:
- ✅ Lock icon in address bar
- ✅ "Secure" or "Connection is secure" message
- ✅ HTTPS in the URL

## What Certbot Does Automatically

When you run `certbot --nginx`, it will:

1. ✅ Get SSL certificate from Let's Encrypt
2. ✅ Configure Nginx for HTTPS (port 443)
3. ✅ Set up HTTP to HTTPS redirect
4. ✅ Configure SSL for both domains (greenwoodscity.in and www.greenwoodscity.in)
5. ✅ Set up auto-renewal

## After SSL Installation

Your Nginx config will automatically be updated to:

```nginx
# HTTP - Redirects to HTTPS
server {
    listen 80;
    server_name greenwoodscity.in www.greenwoodscity.in;
    return 301 https://$server_name$request_uri;
}

# HTTPS - Serves your app
server {
    listen 443 ssl http2;
    server_name greenwoodscity.in www.greenwoodscity.in;

    ssl_certificate /etc/letsencrypt/live/greenwoodscity.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/greenwoodscity.in/privkey.pem;
    
    # ... SSL settings ...
    
    location / {
        proxy_pass http://localhost:3000;
        # ... proxy settings ...
    }
}
```

## Troubleshooting

### If Certbot Still Fails

1. **Make sure app is running:**
   ```bash
   pm2 status
   curl http://localhost:3000
   ```

2. **Make sure domain is accessible:**
   ```bash
   curl http://greenwoodscity.in
   ```

3. **Check DNS is pointing correctly:**
   ```bash
   nslookup greenwoodscity.in
   # Should show: 31.97.232.51
   ```

4. **Check Nginx error logs:**
   ```bash
   tail -20 /var/log/nginx/error.log
   ```

### If You Get "500 Error" During Certbot

The app might not be responding. Fix it first:

```bash
# Check app logs
pm2 logs greenwood-city --lines 50

# Restart app
pm2 restart greenwood-city

# Test again
curl http://localhost:3000
```

## Quick Checklist

Before running Certbot, ensure:
- [ ] Only ONE greenwood-city instance in PM2
- [ ] App is running and responding on port 3000
- [ ] Domain is accessible via HTTP
- [ ] DNS points to 31.97.232.51
- [ ] Nginx is running
- [ ] Ports 80 and 443 are open in firewall

## Summary

**Current:** HTTP only → "Not secure"  
**After SSL:** HTTPS enabled → "Secure" ✅

Once you complete the SSL certificate installation, your site will be secure and show the lock icon in the browser.

