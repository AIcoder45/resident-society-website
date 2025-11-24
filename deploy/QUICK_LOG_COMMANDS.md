# Quick Log Commands Reference

## 🚀 Most Common Commands

### Connect to VPS
```bash
ssh root@31.97.232.51
```

### View Application Logs
```bash
# View last 100 lines
pm2 logs greenwood-city --lines 100

# Follow logs in real-time (live updates)
pm2 logs greenwood-city --follow

# View only errors
pm2 logs greenwood-city --err --lines 100
```

### Check Application Status
```bash
pm2 status
pm2 show greenwood-city
```

### View Nginx Logs
```bash
# Error log
tail -f /var/log/nginx/error.log

# Access log
tail -f /var/log/nginx/access.log
```

### Restart Application
```bash
pm2 restart greenwood-city
```

---

## 🔍 Quick Diagnostic

### Run the Log Checker Script
```bash
cd /var/www/greenwood-city
chmod +x deploy/check-logs.sh
./deploy/check-logs.sh
```

---

## 📋 Common Issues

### App Not Starting?
```bash
pm2 logs greenwood-city --err --lines 100
pm2 status
```

### 502 Bad Gateway?
```bash
pm2 status
tail -n 50 /var/log/nginx/error.log
curl http://localhost:3000
```

### 500 Error?
```bash
pm2 logs greenwood-city --err --lines 200
pm2 logs greenwood-city --lines 200 | grep -i "error"
```

### Strapi Connection Issues?
```bash
pm2 logs greenwood-city --lines 200 | grep -i "strapi"
pm2 logs greenwood-city --lines 200 | grep "❌"
```

---

## 📁 Log File Locations

- PM2 Error: `/var/www/greenwood-city/logs/pm2-error.log`
- PM2 Output: `/var/www/greenwood-city/logs/pm2-out.log`
- Nginx Error: `/var/log/nginx/error.log`
- Nginx Access: `/var/log/nginx/access.log`

---

## 💡 Pro Tips

1. **Start with:** `pm2 logs greenwood-city --lines 100`
2. **For real-time:** `pm2 logs greenwood-city --follow`
3. **For errors only:** `pm2 logs greenwood-city --err --lines 100`
4. **Filter Strapi:** `pm2 logs greenwood-city --lines 200 | grep -i "strapi"`

---

**Full Guide:** See `deploy/CHECK_LOGS_GUIDE.md` for complete documentation.

