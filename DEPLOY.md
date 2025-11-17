# One-Command Deployment

Deploy your Greenwood City website to the VPS with a single command - no file copying needed!

## 🚀 Quick Deploy

### For Windows (PowerShell/CMD):
```powershell
.\deploy.bat
```

### For Mac/Linux/Git Bash:
```bash
chmod +x deploy.sh
./deploy.sh
```

## What It Does

The deployment script will automatically:

1. ✅ Connect to your VPS (31.97.232.51)
2. ✅ Install Node.js 20, PM2, Nginx, Git
3. ✅ Configure firewall (ports 22, 80, 443)
4. ✅ Clone/update repository from GitHub
5. ✅ Install dependencies
6. ✅ Build the application
7. ✅ Configure Nginx for greenwoodscity.in
8. ✅ Start the application with PM2

## Prerequisites

1. **SSH Access**: You need SSH access to the VPS
   ```bash
   ssh root@31.97.232.51
   ```

2. **SSH Key Setup** (Recommended):
   ```bash
   # Generate SSH key if you don't have one
   ssh-keygen -t rsa -b 4096
   
   # Copy to server
   ssh-copy-id root@31.97.232.51
   ```

   Or use password authentication (you'll be prompted)

## After Deployment

### 1. Configure Environment Variables
```bash
ssh root@31.97.232.51
cd /var/www/greenwood-city
cp deploy/env.production.template .env.production
nano .env.production
```

### 2. Setup SSL Certificate (HTTPS)
```bash
ssh root@31.97.232.51
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d greenwoodscity.in -d www.greenwoodscity.in
```

### 3. Verify Deployment
```bash
# Check PM2 status
ssh root@31.97.232.51 'pm2 status'

# View logs
ssh root@31.97.232.51 'pm2 logs greenwood-city'

# Visit website
# http://greenwoodscity.in
```

## Update Application

To update after code changes, run the deploy script again:
```bash
./deploy.sh
# or
.\deploy.bat
```

It will automatically pull the latest changes and rebuild.

## Manual Commands (if needed)

If you prefer to run commands manually:

```bash
ssh root@31.97.232.51

# Update code
cd /var/www/greenwood-city
git pull origin main

# Rebuild
npm install --production
npm run build

# Restart
pm2 restart greenwood-city
```

## Troubleshooting

### SSH Connection Failed
- Ensure you have SSH access: `ssh root@31.97.232.51`
- Check if SSH key is set up correctly
- Verify server is accessible

### Build Errors
- Check PM2 logs: `ssh root@31.97.232.51 'pm2 logs greenwood-city'`
- Verify Node.js version: `ssh root@31.97.232.51 'node -v'`
- Check disk space: `ssh root@31.97.232.51 'df -h'`

### Application Not Starting
- Check PM2 status: `ssh root@31.97.232.51 'pm2 status'`
- View error logs: `ssh root@31.97.232.51 'pm2 logs greenwood-city --err'`
- Verify environment variables are set

## Configuration

All settings are in the deploy script:
- **VPS IP**: 31.97.232.51
- **Domain**: greenwoodscity.in
- **Git Repo**: https://github.com/AIcoder45/resident-society-website.git
- **App Path**: /var/www/greenwood-city

---

**That's it!** Just run the script and your website will be deployed. 🎉

