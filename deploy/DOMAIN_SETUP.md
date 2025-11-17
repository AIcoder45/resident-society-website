# Domain Setup Guide - greenwoodscity.in

Complete guide on how `greenwoodscity.in` redirects to your Next.js application.

## 🌐 How It Works

```
User visits greenwoodscity.in
    ↓
DNS resolves to VPS IP (31.97.232.51)
    ↓
Nginx receives request on port 80/443
    ↓
Nginx proxies to Next.js app (localhost:3000)
    ↓
Next.js serves your application
```

## 📋 Step-by-Step Setup

### Step 1: DNS Configuration

**In your domain registrar (where you bought greenwoodscity.in):**

1. Go to DNS Management
2. Add/Edit A Record:
   ```
   Type: A
   Name: @ (or blank, or greenwoodscity.in)
   Value: 31.97.232.51
   TTL: 3600 (or Auto)
   ```

3. Add/Edit A Record for www:
   ```
   Type: A
   Name: www
   Value: 31.97.232.51
   TTL: 3600 (or Auto)
   ```

**Wait for DNS propagation** (can take 5 minutes to 48 hours, usually 1-2 hours)

### Step 2: Verify DNS is Working

```bash
# Check if DNS is pointing to your VPS
nslookup greenwoodscity.in
# Should show: 31.97.232.51

# Or use dig
dig greenwoodscity.in +short
# Should show: 31.97.232.51
```

### Step 3: Nginx Configuration

The deployment script already creates this configuration at:
`/etc/nginx/sites-available/greenwood-city`

**Current Configuration:**
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

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
```

### Step 4: Verify Nginx Configuration

```bash
ssh root@31.97.232.51

# Test Nginx configuration
nginx -t

# Check if site is enabled
ls -la /etc/nginx/sites-enabled/

# Should see: greenwood-city -> ../sites-available/greenwood-city

# Reload Nginx
systemctl reload nginx
```

### Step 5: Verify Application is Running

```bash
# Check PM2 status
pm2 status

# Should show greenwood-city as online

# Check if app is listening on port 3000
netstat -tulpn | grep 3000
# Should show: node process listening on :3000

# Test locally on server
curl http://localhost:3000
```

### Step 6: Test Domain Access

```bash
# From your local machine
curl http://greenwoodscity.in

# Or open in browser
# http://greenwoodscity.in
```

## 🔒 Step 7: Setup SSL (HTTPS)

After DNS is working, setup SSL certificate:

```bash
ssh root@31.97.232.51

# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d greenwoodscity.in -d www.greenwoodscity.in

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended: Yes)
```

After SSL setup, Nginx will automatically:
- Listen on port 443 (HTTPS)
- Redirect HTTP (port 80) to HTTPS
- Serve your app over secure connection

## 🔍 Troubleshooting

### Domain Not Resolving

```bash
# Check DNS
nslookup greenwoodscity.in

# If not showing 31.97.232.51:
# 1. Wait for DNS propagation (up to 48 hours)
# 2. Check DNS settings in domain registrar
# 3. Clear DNS cache: ipconfig /flushdns (Windows) or sudo dscacheutil -flushcache (Mac)
```

### 502 Bad Gateway

```bash
# Check if Next.js app is running
pm2 status

# Check if app is listening
netstat -tulpn | grep 3000

# Check PM2 logs
pm2 logs greenwood-city

# Restart app
pm2 restart greenwood-city
```

### Nginx Not Serving

```bash
# Check Nginx status
systemctl status nginx

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

### Port 80/443 Not Accessible

```bash
# Check firewall
ufw status

# Should show:
# 80/tcp    ALLOW
# 443/tcp   ALLOW

# If not, add:
ufw allow 80/tcp
ufw allow 443/tcp
```

## 📊 Complete Flow Diagram

```
┌─────────────────┐
│  User Browser   │
│ greenwoodscity.in│
└────────┬────────┘
         │
         │ DNS Query
         ▼
┌─────────────────┐
│  DNS Server     │
│  (Your Registrar)│
└────────┬────────┘
         │
         │ Returns: 31.97.232.51
         ▼
┌─────────────────┐
│  VPS Server     │
│  31.97.232.51   │
└────────┬────────┘
         │
         │ Port 80/443
         ▼
┌─────────────────┐
│     Nginx       │
│  (Reverse Proxy)│
└────────┬────────┘
         │
         │ Proxy to localhost:3000
         ▼
┌─────────────────┐
│   Next.js App   │
│   (PM2 Process) │
│   Port 3000     │
└─────────────────┘
```

## ✅ Verification Checklist

- [ ] DNS A record points to 31.97.232.51
- [ ] DNS propagation completed (check with nslookup)
- [ ] Nginx is running: `systemctl status nginx`
- [ ] Nginx configuration is correct: `nginx -t`
- [ ] Site is enabled: `ls /etc/nginx/sites-enabled/`
- [ ] Next.js app is running: `pm2 status`
- [ ] App is listening on port 3000: `netstat -tulpn | grep 3000`
- [ ] Firewall allows ports 80 and 443: `ufw status`
- [ ] Can access locally: `curl http://localhost:3000`
- [ ] Can access via domain: `curl http://greenwoodscity.in`
- [ ] SSL certificate installed (optional but recommended)

## 🎯 Quick Commands Summary

```bash
# Check DNS
nslookup greenwoodscity.in

# Check Nginx
nginx -t && systemctl status nginx

# Check App
pm2 status && pm2 logs greenwood-city

# Check Ports
netstat -tulpn | grep -E ':(80|443|3000)'

# Test Locally
curl http://localhost:3000

# Test Domain
curl http://greenwoodscity.in
```

---

**Once DNS propagates and everything is configured, visiting `greenwoodscity.in` will show your Next.js application!** 🎉

