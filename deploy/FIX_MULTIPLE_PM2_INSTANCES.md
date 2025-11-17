# Fix: Multiple PM2 Instances Running

## Problem
PM2 shows multiple instances of `greenwood-city` running:
- ID 1: greenwood-city (cluster mode)
- ID 2: greenwood-city (fork mode) 
- ID 3: greenwood-city (fork mode)

This can cause:
- Port conflicts
- Resource waste
- Confusion
- SSL certificate issues

## Solution: Clean Up and Start Fresh

### Step 1: Stop and Delete All greenwood-city Instances

```bash
# Stop all instances
pm2 stop greenwood-city

# Delete all instances
pm2 delete greenwood-city

# Verify they're gone
pm2 status
```

### Step 2: Start Fresh with Single Instance

```bash
cd /var/www/greenwood-city

# Make sure ecosystem.config.js exists and is correct
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'greenwood-city',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/greenwood-city',
    instances: 1,  // Only 1 instance
    exec_mode: 'fork',  // Use fork, not cluster
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

# Start with single instance
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Verify only one instance is running
pm2 status
```

### Step 3: Verify It's Working

```bash
# Check status (should show only 1 greenwood-city)
pm2 status

# Check if port 3000 is in use (should show only one process)
netstat -tulpn | grep 3000

# Test if app responds
curl http://localhost:3000

# Check logs
pm2 logs greenwood-city --lines 20
```

## Why This Happened

Multiple instances can be created by:
- Starting the app multiple times with different commands
- Using `pm2 start` multiple times
- Having different PM2 configs
- Cluster mode vs fork mode confusion

## Prevention

Always use:
```bash
# Check if already running
pm2 list | grep greenwood-city

# If exists, restart
pm2 restart greenwood-city

# If not, start fresh
pm2 start ecosystem.config.js
```

## After Cleanup: Get SSL Certificate

Once you have only ONE instance running:

```bash
# Test app is working
curl http://localhost:3000
curl http://greenwoodscity.in

# Get SSL certificate
certbot --nginx -d greenwoodscity.in -d www.greenwoodscity.in
```

## Quick Cleanup Script

Run this to clean everything up:

```bash
#!/bin/bash

echo "Cleaning up PM2 instances..."

# Stop and delete all greenwood-city instances
pm2 stop greenwood-city 2>/dev/null
pm2 delete greenwood-city 2>/dev/null

echo "Starting fresh instance..."

cd /var/www/greenwood-city

# Ensure ecosystem.config.js is correct
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'greenwood-city',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/greenwood-city',
    instances: 1,
    exec_mode: 'fork',
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

mkdir -p logs

# Start single instance
pm2 start ecosystem.config.js
pm2 save

echo "Done! Checking status..."
pm2 status

echo ""
echo "Test app: curl http://localhost:3000"
```

