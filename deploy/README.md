# Deployment Files for Hostinger VPS

This directory contains all the files needed to deploy the Greenwood City website to your Hostinger VPS.

## 📁 Files Overview

### 1. **DEPLOYMENT_GUIDE.md** ⭐ START HERE
   - Complete step-by-step deployment instructions
   - Troubleshooting guide
   - Security best practices
   - **Read this first for detailed instructions**

### 2. **QUICK_START.md** 🚀
   - Quick reference guide
   - Fast deployment steps (5 minutes)
   - Common commands
   - Use this for quick refreshers

### 3. **deploy.sh** 🔧
   - Automated server setup script
   - Installs Node.js, PM2, Nginx, Git
   - Configures firewall
   - Sets up application directory
   - **Run this first on your VPS**

### 4. **nginx.conf** 🌐
   - Nginx reverse proxy configuration
   - HTTP and HTTPS (SSL) setup
   - Gzip compression enabled
   - Copy to `/etc/nginx/sites-available/greenwood-city`

### 5. **ecosystem.config.js** ⚙️
   - PM2 process manager configuration
   - Auto-restart settings
   - Log file locations
   - Memory limits
   - Place in your application root directory

### 6. **env.production.template** 🔐
   - Environment variables template
   - Copy to `.env.production` in app root
   - Update with your actual values
   - **Never commit actual .env files to Git**

### 7. **update.sh** 🔄
   - Quick update script for code changes
   - Pulls latest code, rebuilds, restarts
   - Use after making code changes

---

## 🎯 Deployment Workflow

```
1. Read DEPLOYMENT_GUIDE.md
   ↓
2. Upload deploy.sh to VPS and run it
   ↓
3. Upload your application code
   ↓
4. Configure .env.production
   ↓
5. Build and start application
   ↓
6. Configure Nginx
   ↓
7. Setup SSL certificate
   ↓
8. Done! 🎉
```

---

## 📝 Quick Commands Reference

### Initial Setup
```bash
# Connect to VPS
ssh root@31.97.232.51

# Run setup script
chmod +x /root/deploy.sh
/root/deploy.sh
```

### Application Management
```bash
# Start
pm2 start ecosystem.config.js

# Stop
pm2 stop greenwood-city

# Restart
pm2 restart greenwood-city

# View logs
pm2 logs greenwood-city

# Status
pm2 status
```

### Updates
```bash
cd /var/www/greenwood-city
./deploy/update.sh
```

### Clone Repository
```bash
cd /var/www
git clone https://github.com/AIcoder45/resident-society-website.git greenwood-city
```

---

## 🔗 VPS Details

- **IP Address:** 31.97.232.51
- **User:** root
- **Domain:** greenwoodscity.in
- **Git Repository:** https://github.com/AIcoder45/resident-society-website.git
- **Application Path:** /var/www/greenwood-city
- **Port:** 3000 (internal)
- **Web Server:** Nginx (port 80/443)

---

## ⚠️ Important Notes

1. **Domain Setup:** Make sure `greenwoodscity.in` DNS points to `31.97.232.51`
2. **Environment Variables:** Always use `.env.production` for production
3. **SSL Certificate:** Set up HTTPS using Let's Encrypt (free)
4. **Backups:** Regularly backup your application and database
5. **Security:** Keep system updated and use strong passwords/SSH keys

---

## 📚 Documentation

- **Full Guide:** See `DEPLOYMENT_GUIDE.md`
- **Quick Reference:** See `QUICK_START.md`
- **Application Docs:** See root `README.md`

---

## 🆘 Need Help?

1. Check `DEPLOYMENT_GUIDE.md` troubleshooting section
2. Check PM2 logs: `pm2 logs greenwood-city`
3. Check Nginx logs: `tail -f /var/log/nginx/error.log`
4. Verify environment variables are set correctly
5. Ensure firewall allows ports 80, 443, and 22

---

**Happy Deploying!** 🚀

