#!/bin/bash

# Greenwood City Website - One-Command Deployment Script
# Run this from your local machine - it will deploy to VPS via SSH

set -e

# Configuration
VPS_IP="31.97.232.51"
VPS_USER="root"
APP_NAME="greenwood-city"
APP_DIR="/var/www/${APP_NAME}"
GIT_REPO="https://github.com/AIcoder45/resident-society-website.git"
DOMAIN="greenwoodscity.in"
PORT="3000"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check SSH connection
print_info "Testing SSH connection to ${VPS_USER}@${VPS_IP}..."
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes ${VPS_USER}@${VPS_IP} exit 2>/dev/null; then
    print_error "Cannot connect to ${VPS_USER}@${VPS_IP}"
    print_info "Please ensure:"
    echo "  1. SSH key is set up (or password authentication is enabled)"
    echo "  2. Server is accessible"
    echo "  3. You have the correct credentials"
    exit 1
fi
print_success "SSH connection successful"

# Deploy script that runs on remote server
print_info "Deploying to VPS..."
ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
set -e

APP_NAME="greenwood-city"
APP_DIR="/var/www/${APP_NAME}"
GIT_REPO="https://github.com/AIcoder45/resident-society-website.git"
DOMAIN="greenwoodscity.in"
PORT="3000"
NODE_VERSION="20"

echo "=========================================="
echo "Greenwood City Website - VPS Deployment"
echo "=========================================="

# Step 1: Update system
echo "→ Updating system packages..."
apt-get update -y > /dev/null 2>&1
apt-get upgrade -y > /dev/null 2>&1
echo "✓ System updated"

# Step 2: Install Node.js
echo "→ Installing Node.js ${NODE_VERSION}..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - > /dev/null 2>&1
    apt-get install -y nodejs > /dev/null 2>&1
    echo "✓ Node.js installed"
else
    echo "✓ Node.js already installed: $(node -v)"
fi

# Step 3: Install PM2
echo "→ Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2 > /dev/null 2>&1
    pm2 startup systemd -u root --hp /root > /dev/null 2>&1 || true
    echo "✓ PM2 installed"
else
    echo "✓ PM2 already installed"
fi

# Step 4: Install Nginx
echo "→ Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx > /dev/null 2>&1
    systemctl enable nginx > /dev/null 2>&1
    echo "✓ Nginx installed"
else
    echo "✓ Nginx already installed"
fi

# Step 5: Install Git and build tools
echo "→ Installing Git and build tools..."
apt-get install -y git build-essential python3 > /dev/null 2>&1
echo "✓ Build tools installed"

# Step 6: Configure firewall
echo "→ Configuring firewall..."
if ! command -v ufw &> /dev/null; then
    apt-get install -y ufw > /dev/null 2>&1
fi
ufw allow 22/tcp > /dev/null 2>&1 || true
ufw allow 80/tcp > /dev/null 2>&1 || true
ufw allow 443/tcp > /dev/null 2>&1 || true
ufw --force enable > /dev/null 2>&1 || true
echo "✓ Firewall configured"

# Step 7: Clone or update repository
echo "→ Setting up application..."
if [ -d "${APP_DIR}" ]; then
    if [ -d "${APP_DIR}/.git" ]; then
        echo "  → Application directory exists, pulling latest changes..."
        cd ${APP_DIR}
        git fetch origin > /dev/null 2>&1 || true
        git reset --hard origin/main > /dev/null 2>&1 || git reset --hard origin/master > /dev/null 2>&1 || true
        git clean -fd > /dev/null 2>&1 || true
    else
        echo "  → Directory exists but is not a git repository, removing and cloning fresh..."
        rm -rf ${APP_DIR}
        mkdir -p /var/www
        cd /var/www
        git clone ${GIT_REPO} ${APP_NAME} > /dev/null 2>&1
        cd ${APP_DIR}
    fi
else
    echo "  → Cloning repository..."
    mkdir -p /var/www
    cd /var/www
    git clone ${GIT_REPO} ${APP_NAME} > /dev/null 2>&1
    cd ${APP_DIR}
fi
echo "✓ Repository ready"

# Step 8: Create logs directory
mkdir -p ${APP_DIR}/logs
chown -R www-data:www-data ${APP_DIR} > /dev/null 2>&1 || true

# Step 9: Install dependencies (including devDependencies for build)
echo "→ Installing dependencies..."
cd ${APP_DIR}
npm install > /dev/null 2>&1
echo "✓ Dependencies installed"

# Step 10: Build application
echo "→ Building application..."
npm run build > /dev/null 2>&1
echo "✓ Application built"

# Step 11: Create PM2 ecosystem file
cat > ${APP_DIR}/ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: '${APP_NAME}',
    script: 'npm',
    args: 'start',
    cwd: '${APP_DIR}',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: ${PORT}
    },
    error_file: '${APP_DIR}/logs/pm2-error.log',
    out_file: '${APP_DIR}/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
EOF
echo "✓ PM2 config created"

# Step 12: Create Nginx configuration
cat > /etc/nginx/sites-available/${APP_NAME} <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://localhost:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
EOF

# Enable Nginx site
ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t > /dev/null 2>&1
systemctl reload nginx > /dev/null 2>&1
echo "✓ Nginx configured"

# Step 13: Start/restart PM2
echo "→ Starting application..."
cd ${APP_DIR}
pm2 delete ${APP_NAME} > /dev/null 2>&1 || true
pm2 start ecosystem.config.js > /dev/null 2>&1
pm2 save > /dev/null 2>&1
echo "✓ Application started"

echo ""
echo "=========================================="
echo "Deployment completed successfully!"
echo "=========================================="
echo ""
echo "Application: http://${DOMAIN}"
echo "PM2 Status: pm2 status"
echo "View Logs: pm2 logs ${APP_NAME}"
echo ""
echo "Next steps:"
echo "1. Create .env.production file: cd ${APP_DIR} && nano .env.production"
echo "2. Setup SSL: certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo ""

ENDSSH

print_success "=========================================="
print_success "Deployment completed!"
print_success "=========================================="
echo ""
print_info "Your website should be available at:"
echo "  http://${DOMAIN}"
echo ""
print_info "To complete setup:"
echo "  1. SSH to server: ssh ${VPS_USER}@${VPS_IP}"
echo "  2. Create .env.production: cd ${APP_DIR} && nano .env.production"
echo "  3. Setup SSL: certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo ""
print_info "View logs: ssh ${VPS_USER}@${VPS_IP} 'pm2 logs ${APP_NAME}'"
print_info "Check status: ssh ${VPS_USER}@${VPS_IP} 'pm2 status'"

