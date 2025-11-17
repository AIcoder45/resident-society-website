# Quick Deployment Commands

## 🚀 One-Line Commands for Quick Deployment

### Step 1: Connect to VPS
```bash
ssh root@31.97.232.51
```

### Step 2: Run Setup Script
```bash
# Upload script from local machine (PowerShell)
scp deploy/deploy.sh root@31.97.232.51:/root/

# On VPS - Run setup
chmod +x /root/deploy.sh && /root/deploy.sh
```

### Step 3: Clone Repository
```bash
cd /var/www && git clone https://github.com/AIcoder45/resident-society-website.git greenwood-city
```

### Step 4: Configure Environment
```bash
cd /var/www/greenwood-city
cp deploy/env.production.template .env.production
nano .env.production  # Edit with your values
```

### Step 5: Install & Build
```bash
cd /var/www/greenwood-city
npm install --production && npm run build
```

### Step 6: Start Application
```bash
cd /var/www/greenwood-city
pm2 start ecosystem.config.js && pm2 save
```

### Step 7: Setup SSL
```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d greenwoodscity.in -d www.greenwoodscity.in
```

## ✅ Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs greenwood-city

# Test Nginx
nginx -t && systemctl reload nginx

# Visit website
curl http://greenwoodscity.in
```

## 🔄 Update Application (After Code Changes)

```bash
cd /var/www/greenwood-city
git pull origin main
npm install --production
npm run build
pm2 restart greenwood-city
```

Or use the update script:
```bash
cd /var/www/greenwood-city
./deploy/update.sh
```

## 📋 Domain Information

- **Domain:** greenwoodscity.in
- **Git Repository:** https://github.com/AIcoder45/resident-society-website.git
- **VPS IP:** 31.97.232.51

---

**Note:** Make sure DNS A record for `greenwoodscity.in` points to `31.97.232.51` before setting up SSL.

