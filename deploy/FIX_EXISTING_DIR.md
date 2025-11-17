# Fix: Directory Already Exists Error

If you get the error:
```
fatal: destination path 'greenwood-city' already exists and is not an empty directory.
```

## Quick Fix Options

### Option 1: Remove and Re-clone (Recommended)
```bash
ssh root@31.97.232.51
cd /var/www
rm -rf greenwood-city
git clone https://github.com/AIcoder45/resident-society-website.git greenwood-city
```

### Option 2: Update Existing Directory
If the directory is already a git repository:
```bash
ssh root@31.97.232.51
cd /var/www/greenwood-city
git fetch origin
git reset --hard origin/main
git clean -fd
```

### Option 3: Use Updated Deployment Script
The updated `deploy.sh` and `deploy.bat` scripts now automatically handle this:
- If directory exists and is a git repo → pulls updates
- If directory exists but is not a git repo → removes and clones fresh
- If directory doesn't exist → clones fresh

Just run:
```bash
./deploy.sh
# or
.\deploy.bat
```

## Manual Cleanup (if needed)

```bash
ssh root@31.97.232.51

# Stop PM2 process
pm2 stop greenwood-city || true
pm2 delete greenwood-city || true

# Remove directory
cd /var/www
rm -rf greenwood-city

# Clone fresh
git clone https://github.com/AIcoder45/resident-society-website.git greenwood-city
cd greenwood-city

# Continue with setup
npm install --production
npm run build
pm2 start ecosystem.config.js
pm2 save
```

---

**Note:** The updated deployment scripts now handle this automatically, so you won't see this error in future deployments.

