# Quick Start - VPS Deployment

## 🚀 Fast Deployment (5 Minutes)

### Step 1: Connect to VPS
```bash
ssh root@31.97.232.51
```

### Step 2: Run Setup Script
```bash
# Upload script first (from your local machine)
scp deploy/deploy.sh root@31.97.232.51:/root/

# Then on VPS
chmod +x /root/deploy.sh
/root/deploy.sh
```

### Step 3: Upload Your Code
```bash
# Option A: Using Git (recommended)
cd /var/www
git clone https://github.com/AIcoder45/resident-society-website.git greenwood-city
cd greenwood-city

# Option B: Using SCP
# On local: scp -r . root@31.97.232.51:/var/www/greenwood-city/
```

### Step 4: Configure & Build
```bash
cd /var/www/greenwood-city

# Copy environment template
cp deploy/env.production.template .env.production
nano .env.production  # Edit with your values

# Install and build
npm install --production
npm run build
```

### Step 5: Configure Nginx
```bash
# Domain is already configured for greenwoodscity.in
# Verify configuration:
nano /etc/nginx/sites-available/greenwood-city
# Should show: server_name greenwoodscity.in www.greenwoodscity.in;

# Enable site
ln -sf /etc/nginx/sites-available/greenwood-city /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### Step 6: Start Application
```bash
cd /var/www/greenwood-city
pm2 start ecosystem.config.js
pm2 save
```

### Step 7: Setup SSL (Optional but Recommended)
```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d greenwoodscity.in -d www.greenwoodscity.in
```

## ✅ Done!

Visit: `https://greenwoodscity.in`

---

## 📋 Common Commands

```bash
# View logs
pm2 logs greenwood-city

# Restart app
pm2 restart greenwood-city

# Update app (after code changes)
cd /var/www/greenwood-city
./deploy/update.sh

# Check status
pm2 status
```

---

## 📚 Full Documentation

See `DEPLOYMENT_GUIDE.md` for detailed instructions and troubleshooting.

