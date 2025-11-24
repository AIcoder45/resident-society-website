# Recreate Greenwood City Application on VPS

Complete guide to recreate and redeploy the `greenwood-city` application on your VPS.

---

## Prerequisites

- Access to VPS via SSH
- Application code ready (Git repository or local files)
- Domain configured (greenwoodscity.in)

---

## Step 1: Connect to VPS

```bash
ssh root@31.97.232.51
```

---

## Step 2: Install Required Software (If Not Already Installed)

```bash
# Update system
apt-get update -y && apt-get upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2
pm2 startup systemd -u root --hp /root

# Install Nginx
apt-get install -y nginx
systemctl enable nginx

# Install Git and build tools
apt-get install -y git build-essential python3

# Configure firewall
apt-get install -y ufw
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

---

## Step 3: Create Application Directory

```bash
# Create directory
mkdir -p /var/www/greenwood-city
cd /var/www/greenwood-city

# Set permissions
chown -R www-data:www-data /var/www/greenwood-city
```

---

## Step 4: Upload Application Code

### Option A: Clone from Git (Recommended)

```bash
cd /var/www/greenwood-city

# Clone repository
git clone https://github.com/AIcoder45/resident-society-website.git .

# Or if repository is private, use SSH:
# git clone git@github.com:AIcoder45/resident-society-website.git .
```

### Option B: Upload via SCP (From Local Machine)

**On your local machine:**

```bash
# Compress project (excluding node_modules and .next)
tar -czf greenwood-city.tar.gz --exclude='node_modules' --exclude='.next' --exclude='.git' .

# Upload to VPS
scp greenwood-city.tar.gz root@31.97.232.51:/var/www/

# On VPS, extract
ssh root@31.97.232.51
cd /var/www
tar -xzf greenwood-city.tar.gz -C greenwood-city
rm greenwood-city.tar.gz
```

### Option C: Upload via SFTP/FTP Client

Use FileZilla, WinSCP, or similar to upload files to `/var/www/greenwood-city`

---

## Step 5: Install Dependencies

```bash
cd /var/www/greenwood-city

# IMPORTANT: Install ALL dependencies (including devDependencies)
# Next.js build requires devDependencies like tailwindcss, typescript, etc.
npm install

# Note: Do NOT use --production flag here as build process needs devDependencies
```

---

## Step 6: Configure Environment Variables

```bash
cd /var/www/greenwood-city

# Create production environment file
nano .env.production
```

**Add these variables:**

```env
NODE_ENV=production
PORT=3000

# Strapi Configuration (if using)
STRAPI_URL=https://admin.greenwoodscity.in
STRAPI_API_TOKEN=your-strapi-api-token-here

# Push Notifications (if using)
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_EMAIL=mailto:your-email@example.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key

# Site URL
NEXT_PUBLIC_SITE_URL=https://greenwoodscity.in
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

---

## Step 7: Build Application

```bash
cd /var/www/greenwood-city

# Build Next.js application
npm run build
```

**Note:** This may take a few minutes. Be patient!

---

## Step 8: Create PM2 Configuration

```bash
cd /var/www/greenwood-city

# Copy ecosystem config if it exists
# Or create it
nano ecosystem.config.js
```

**Add this configuration:**

```javascript
module.exports = {
  apps: [{
    name: 'greenwood-city',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/greenwood-city',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      STRAPI_URL: process.env.STRAPI_URL || '',
      STRAPI_API_TOKEN: process.env.STRAPI_API_TOKEN || ''
    },
    error_file: '/var/www/greenwood-city/logs/pm2-error.log',
    out_file: '/var/www/greenwood-city/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
```

**Save and exit**

---

## Step 9: Create Logs Directory

```bash
mkdir -p /var/www/greenwood-city/logs
chown -R www-data:www-data /var/www/greenwood-city/logs
```

---

## Step 10: Start Application with PM2

```bash
cd /var/www/greenwood-city

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check status
pm2 status

# View logs
pm2 logs greenwood-city --lines 50
```

---

## Step 11: Configure Nginx

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/greenwood-city
```

**Add this configuration:**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name greenwoodscity.in www.greenwoodscity.in;

    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;

    # For now, proxy to Next.js
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
        
        # Increase timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache static assets
    location /_next/static {
        proxy_cache_valid 200 60m;
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Save and exit**

**Enable the site:**

```bash
# Create symlink
ln -sf /etc/nginx/sites-available/greenwood-city /etc/nginx/sites-enabled/

# Remove default site (optional)
rm -f /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## Step 12: Set Up SSL Certificate (HTTPS)

```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Obtain SSL certificate
certbot --nginx -d greenwoodscity.in -d www.greenwoodscity.in

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose redirect HTTP to HTTPS (recommended: Yes)

# Test auto-renewal
certbot renew --dry-run
```

---

## Step 13: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs greenwood-city --lines 50

# Check if app responds locally
curl http://localhost:3000

# Check Nginx status
systemctl status nginx

# Check Nginx logs
tail -n 20 /var/log/nginx/error.log
```

**Test in browser:**
- Visit: `http://greenwoodscity.in` or `https://greenwoodscity.in`
- Verify all pages load correctly

---

## Step 14: Set Up Auto-Start (If Not Already Done)

```bash
# Set up PM2 startup script
pm2 startup systemd -u root --hp /root

# Save current PM2 processes
pm2 save
```

---

## Quick Recreation Script

**Save this as `recreate-app.sh`:**

```bash
#!/bin/bash
set -e

echo "=========================================="
echo "  Recreating Greenwood City Application"
echo "=========================================="
echo ""

# Step 1: Create directory
echo "1. Creating application directory..."
mkdir -p /var/www/greenwood-city
cd /var/www/greenwood-city
chown -R www-data:www-data /var/www/greenwood-city

# Step 2: Clone repository (update with your repo)
echo "2. Cloning repository..."
# git clone https://github.com/AIcoder45/resident-society-website.git .

# Step 3: Install dependencies
echo "3. Installing dependencies..."
npm install --production

# Step 4: Build application
echo "4. Building application..."
npm run build

# Step 5: Create logs directory
echo "5. Creating logs directory..."
mkdir -p /var/www/greenwood-city/logs
chown -R www-data:www-data /var/www/greenwood-city/logs

# Step 6: Start with PM2
echo "6. Starting with PM2..."
pm2 start ecosystem.config.js || pm2 restart greenwood-city
pm2 save

# Step 7: Configure Nginx
echo "7. Configuring Nginx..."
# Copy your nginx config
# cp deploy/nginx.conf /etc/nginx/sites-available/greenwood-city
ln -sf /etc/nginx/sites-available/greenwood-city /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo ""
echo "✅ Application recreated successfully!"
echo ""
echo "Check status:"
pm2 status
echo ""
echo "View logs:"
echo "  pm2 logs greenwood-city --lines 50"
```

**Make executable and run:**
```bash
chmod +x recreate-app.sh
./recreate-app.sh
```

---

## Troubleshooting

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs greenwood-city --err --lines 100

# Check if port is in use
netstat -tulpn | grep 3000

# Check environment variables
pm2 show greenwood-city | grep env

# Restart application
pm2 restart greenwood-city
```

### Build Fails

```bash
# Check Node.js version
node --version  # Should be 20.x

# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Nginx 502 Error

```bash
# Check if app is running
pm2 status

# Check if app responds locally
curl http://localhost:3000

# Check Nginx error log
tail -n 50 /var/log/nginx/error.log

# Restart application
pm2 restart greenwood-city
```

### Permission Issues

```bash
# Fix ownership
chown -R www-data:www-data /var/www/greenwood-city

# Fix permissions
chmod -R 755 /var/www/greenwood-city
chmod -R 644 /var/www/greenwood-city/.env.production
```

---

## Post-Deployment Checklist

- [ ] Application directory created
- [ ] Code uploaded/cloned
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Application built successfully
- [ ] PM2 process started
- [ ] Nginx configured
- [ ] SSL certificate installed
- [ ] Website accessible via domain
- [ ] All pages loading correctly
- [ ] Logs directory created
- [ ] PM2 auto-start configured

---

## Useful Commands After Recreation

```bash
# View logs
pm2 logs greenwood-city --follow

# Restart application
pm2 restart greenwood-city

# Check status
pm2 status

# Monitor resources
pm2 monit

# Update application
cd /var/www/greenwood-city
git pull
npm install --production
npm run build
pm2 restart greenwood-city
```

---

## Summary

**Quick recreation steps:**

1. Create directory: `mkdir -p /var/www/greenwood-city`
2. Upload/clone code
3. Install dependencies: `npm install --production`
4. Configure environment: Create `.env.production`
5. Build: `npm run build`
6. Start PM2: `pm2 start ecosystem.config.js`
7. Configure Nginx
8. Set up SSL
9. Verify deployment

**Your application should now be running!** 🎉

