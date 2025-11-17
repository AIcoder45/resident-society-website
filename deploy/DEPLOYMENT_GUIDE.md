# Greenwood City Website - VPS Deployment Guide

Complete step-by-step guide for deploying to Hostinger VPS (root@31.97.232.51)

## Prerequisites

- Access to Hostinger VPS via SSH
- Domain name pointing to your VPS IP (31.97.232.51)
- Basic knowledge of Linux commands

---

## Step 1: Connect to Your VPS

### On Windows (PowerShell/CMD):
```bash
ssh root@31.97.232.51
```

### On Mac/Linux:
```bash
ssh root@31.97.232.51
```

**Note:** If this is your first time connecting, you'll be asked to accept the host key. Type `yes` and press Enter.

---

## Step 2: Run the Deployment Script

### Option A: Upload and Run Script (Recommended)

1. **On your local machine**, upload the deployment script:
   ```bash
   scp deploy/deploy.sh root@31.97.232.51:/root/
   ```

2. **On the VPS**, make it executable and run:
   ```bash
   chmod +x /root/deploy.sh
   /root/deploy.sh
   ```

### Option B: Run Commands Manually

If you prefer to run commands manually, follow the steps in the script:

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

## Step 3: Upload Your Application

### Option A: Using Git (Recommended)

1. **On the VPS**, clone your repository:
   ```bash
   cd /var/www
   git clone https://github.com/AIcoder45/resident-society-website.git greenwood-city
   cd greenwood-city
   ```

   **Note:** If your repository is private, you'll need to set up SSH keys or use a personal access token.

### Option B: Using SCP (Direct Upload)

1. **On your local machine**, compress your project (excluding node_modules):
   ```bash
   # On Windows PowerShell
   Compress-Archive -Path .\* -DestinationPath app.zip -Exclude node_modules
   
   # On Mac/Linux
   tar -czf app.tar.gz --exclude='node_modules' --exclude='.git' .
   ```

2. **Upload to VPS**:
   ```bash
   # Windows
   scp app.zip root@31.97.232.51:/var/www/
   
   # Mac/Linux
   scp app.tar.gz root@31.97.232.51:/var/www/
   ```

3. **On the VPS**, extract and set permissions:
   ```bash
   cd /var/www
   unzip app.zip -d greenwood-city
   # OR
   tar -xzf app.tar.gz -C greenwood-city
   
   chown -R www-data:www-data /var/www/greenwood-city
   ```

---

## Step 4: Configure Environment Variables

1. **Create production environment file**:
   ```bash
   cd /var/www/greenwood-city
   cp deploy/.env.production.example .env.production
   nano .env.production
   ```

2. **Update the following variables** (if using Strapi):
   ```env
   NODE_ENV=production
   PORT=3000
   
   # If using Strapi CMS
   STRAPI_URL=https://your-strapi-instance.com
   STRAPI_API_TOKEN=your-strapi-api-token
   
   # If using Push Notifications
   VAPID_PUBLIC_KEY=your-public-key
   VAPID_PRIVATE_KEY=your-private-key
   VAPID_EMAIL=mailto:your-email@example.com
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
   ```

3. **Save and exit** (Ctrl+X, then Y, then Enter in nano)

---

## Step 5: Install Dependencies and Build

```bash
cd /var/www/greenwood-city

# Install dependencies
npm install --production

# Build the application
npm run build
```

**Note:** The build process may take a few minutes. Be patient!

---

## Step 6: Configure Nginx

1. **Update Nginx configuration**:
   ```bash
   nano /etc/nginx/sites-available/greenwood-city
   ```

2. **Verify domain is set correctly** (already configured for greenwoodscity.in):
   ```nginx
   server_name greenwoodscity.in www.greenwoodscity.in;
   ```

3. **Enable the site**:
   ```bash
   ln -sf /etc/nginx/sites-available/greenwood-city /etc/nginx/sites-enabled/
   rm -f /etc/nginx/sites-enabled/default
   ```

4. **Test and reload Nginx**:
   ```bash
   nginx -t
   systemctl reload nginx
   ```

---

## Step 7: Start the Application with PM2

1. **Create logs directory**:
   ```bash
   mkdir -p /var/www/greenwood-city/logs
   chown -R www-data:www-data /var/www/greenwood-city/logs
   ```

2. **Start with PM2**:
   ```bash
   cd /var/www/greenwood-city
   pm2 start ecosystem.config.js
   pm2 save
   ```

3. **Verify it's running**:
   ```bash
   pm2 status
   pm2 logs greenwood-city
   ```

---

## Step 8: Set Up SSL Certificate (HTTPS)

1. **Install Certbot**:
   ```bash
   apt-get install -y certbot python3-certbot-nginx
   ```

2. **Obtain SSL certificate**:
   ```bash
   certbot --nginx -d greenwoodscity.in -d www.greenwoodscity.in
   ```

3. **Follow the prompts**:
   - Enter your email address
   - Agree to terms
   - Choose whether to redirect HTTP to HTTPS (recommended: Yes)

4. **Test auto-renewal**:
   ```bash
   certbot renew --dry-run
   ```

---

## Step 9: Verify Deployment

1. **Check application status**:
   ```bash
   pm2 status
   pm2 logs greenwood-city --lines 50
   ```

2. **Check Nginx status**:
   ```bash
   systemctl status nginx
   ```

3. **Visit your website**:
   - Open browser: `http://greenwoodscity.in` or `https://greenwoodscity.in`
   - Verify all pages load correctly

---

## Useful Commands

### PM2 Management
```bash
# View status
pm2 status

# View logs
pm2 logs greenwood-city

# Restart application
pm2 restart greenwood-city

# Stop application
pm2 stop greenwood-city

# View detailed info
pm2 show greenwood-city

# Monitor in real-time
pm2 monit
```

### Nginx Management
```bash
# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Restart Nginx
systemctl restart nginx

# View error logs
tail -f /var/log/nginx/error.log

# View access logs
tail -f /var/log/nginx/access.log
```

### Application Updates
```bash
cd /var/www/greenwood-city

# Pull latest changes (if using Git)
git pull

# Reinstall dependencies (if package.json changed)
npm install --production

# Rebuild application
npm run build

# Restart PM2
pm2 restart greenwood-city
```

---

## Troubleshooting

### Application Not Starting

1. **Check PM2 logs**:
   ```bash
   pm2 logs greenwood-city --err
   ```

2. **Check environment variables**:
   ```bash
   cd /var/www/greenwood-city
   cat .env.production
   ```

3. **Verify build completed**:
   ```bash
   ls -la /var/www/greenwood-city/.next
   ```

### Nginx 502 Bad Gateway

1. **Check if application is running**:
   ```bash
   pm2 status
   ```

2. **Check if port 3000 is in use**:
   ```bash
   netstat -tulpn | grep 3000
   ```

3. **Restart application**:
   ```bash
   pm2 restart greenwood-city
   ```

### Can't Access Website

1. **Check firewall**:
   ```bash
   ufw status
   ```

2. **Check Nginx configuration**:
   ```bash
   nginx -t
   ```

3. **Check DNS**:
   ```bash
   nslookup yourdomain.com
   ```

### Out of Memory Errors

1. **Check memory usage**:
   ```bash
   free -h
   pm2 monit
   ```

2. **Increase swap space** (if needed):
   ```bash
   fallocate -l 2G /swapfile
   chmod 600 /swapfile
   mkswap /swapfile
   swapon /swapfile
   echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
   ```

---

## Security Best Practices

1. **Change SSH port** (optional but recommended):
   ```bash
   nano /etc/ssh/sshd_config
   # Change Port 22 to a different port
   systemctl restart sshd
   ```

2. **Set up SSH key authentication** (disable password login):
   ```bash
   # On local machine, generate key if you don't have one
   ssh-keygen -t rsa -b 4096
   
   # Copy to server
   ssh-copy-id root@31.97.232.51
   ```

3. **Keep system updated**:
   ```bash
   apt-get update && apt-get upgrade -y
   ```

4. **Regular backups**:
   - Backup `/var/www/greenwood-city`
   - Backup database (if using Strapi)
   - Backup Nginx configuration

---

## Quick Deployment Script

For future updates, you can use this quick script:

```bash
#!/bin/bash
cd /var/www/greenwood-city
git pull
npm install --production
npm run build
pm2 restart greenwood-city
```

Save as `update.sh` and run: `chmod +x update.sh && ./update.sh`

---

## Support

If you encounter issues:

1. Check PM2 logs: `pm2 logs greenwood-city`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Verify all environment variables are set correctly
4. Ensure all ports are open in firewall

---

## Summary Checklist

- [ ] Connected to VPS via SSH
- [ ] Ran deployment script or installed dependencies manually
- [ ] Uploaded application files to `/var/www/greenwood-city`
- [ ] Created and configured `.env.production`
- [ ] Installed npm dependencies
- [ ] Built the application (`npm run build`)
- [ ] Configured Nginx with your domain
- [ ] Started application with PM2
- [ ] Set up SSL certificate (HTTPS)
- [ ] Verified website is accessible
- [ ] Tested all pages and features

---

**Deployment Complete!** 🎉

Your Greenwood City website should now be live at `https://yourdomain.com`

