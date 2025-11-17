# Start Application with PM2

## Problem
```
[PM2][ERROR] Process or Namespace greenwood-city not found
```

This means the application hasn't been started with PM2 yet.

## Solution

### Step 1: Navigate to Application Directory
```bash
cd /var/www/greenwood-city
```

### Step 2: Start Application with PM2

**Option A: Using ecosystem.config.js (Recommended)**
```bash
pm2 start ecosystem.config.js
pm2 save
```

**Option B: Direct start command**
```bash
pm2 start npm --name greenwood-city -- start
pm2 save
```

**Option C: If ecosystem.config.js doesn't exist, create it:**
```bash
cat > ecosystem.config.js << 'EOF'
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
      PORT: 3000
    },
    error_file: '/var/www/greenwood-city/logs/pm2-error.log',
    out_file: '/var/www/greenwood-city/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start
pm2 start ecosystem.config.js
pm2 save
```

### Step 3: Verify It's Running
```bash
pm2 status
pm2 logs greenwood-city
```

## Common Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs greenwood-city

# Restart (after it's started)
pm2 restart greenwood-city

# Stop
pm2 stop greenwood-city

# Delete
pm2 delete greenwood-city

# Monitor
pm2 monit
```

## Troubleshooting

### If build failed:
```bash
cd /var/www/greenwood-city
npm run build
```

### If dependencies missing:
```bash
cd /var/www/greenwood-city
npm install
npm run build
```

### Check if port 3000 is in use:
```bash
netstat -tulpn | grep 3000
# or
lsof -i :3000
```

### View PM2 logs for errors:
```bash
pm2 logs greenwood-city --err
```

