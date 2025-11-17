#!/bin/bash

# Greenwood City Website - VPS Deployment Script
# For Hostinger VPS: root@31.97.232.51

set -e  # Exit on error

echo "=========================================="
echo "Greenwood City Website - VPS Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="greenwood-city"
APP_DIR="/var/www/${APP_NAME}"
APP_USER="www-data"
NODE_VERSION="20"
PORT="3000"
DOMAIN="${DOMAIN:-greenwoodscity.in}"
GIT_REPO="https://github.com/AIcoder45/resident-society-website.git"

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use sudo)"
    exit 1
fi

print_info "Starting deployment process..."

# Step 1: Update system packages
print_info "Updating system packages..."
apt-get update -y
apt-get upgrade -y
print_success "System packages updated"

# Step 2: Install Node.js using NodeSource repository
print_info "Installing Node.js ${NODE_VERSION}..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
    print_success "Node.js installed"
else
    NODE_CURRENT=$(node -v)
    print_info "Node.js already installed: ${NODE_CURRENT}"
fi

# Verify Node.js and npm
NODE_VERSION_INSTALLED=$(node -v)
NPM_VERSION_INSTALLED=$(npm -v)
print_success "Node.js: ${NODE_VERSION_INSTALLED}, npm: ${NPM_VERSION_INSTALLED}"

# Step 3: Install PM2 globally
print_info "Installing PM2 process manager..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 startup systemd -u root --hp /root
    print_success "PM2 installed and configured"
else
    print_info "PM2 already installed"
fi

# Step 4: Install Nginx
print_info "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl enable nginx
    print_success "Nginx installed"
else
    print_info "Nginx already installed"
fi

# Step 5: Install Git
print_info "Installing Git..."
if ! command -v git &> /dev/null; then
    apt-get install -y git
    print_success "Git installed"
else
    print_info "Git already installed"
fi

# Step 6: Install build essentials (for native modules)
print_info "Installing build essentials..."
apt-get install -y build-essential python3
print_success "Build essentials installed"

# Step 7: Create application directory
print_info "Creating application directory..."
mkdir -p ${APP_DIR}
chown -R ${APP_USER}:${APP_USER} ${APP_DIR}
print_success "Application directory created: ${APP_DIR}"

# Step 8: Install UFW firewall (if not installed)
print_info "Configuring firewall..."
if ! command -v ufw &> /dev/null; then
    apt-get install -y ufw
fi
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
print_success "Firewall configured"

# Step 9: Create Nginx configuration
print_info "Creating Nginx configuration..."
cat > /etc/nginx/sites-available/${APP_NAME} <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Redirect HTTP to HTTPS (uncomment after SSL setup)
    # return 301 https://\$server_name\$request_uri;

    # For now, proxy to Next.js
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

    # Increase timeouts for Next.js
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t
systemctl reload nginx
print_success "Nginx configuration created and enabled"

# Step 10: Create PM2 ecosystem file
print_info "Creating PM2 ecosystem file..."
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

mkdir -p ${APP_DIR}/logs
chown -R ${APP_USER}:${APP_USER} ${APP_DIR}/logs
print_success "PM2 ecosystem file created"

print_success "=========================================="
print_success "Server setup completed successfully!"
print_success "=========================================="
echo ""
print_info "Next steps:"
echo "1. Clone repository: cd /var/www && git clone ${GIT_REPO} greenwood-city"
echo "2. Create .env.production file with your environment variables"
echo "3. Run: cd ${APP_DIR} && npm install --production"
echo "4. Run: cd ${APP_DIR} && npm run build"
echo "5. Run: pm2 start ecosystem.config.js"
echo "6. Run: pm2 save"
echo ""
print_info "To view logs: pm2 logs ${APP_NAME}"
print_info "To restart: pm2 restart ${APP_NAME}"
print_info "To stop: pm2 stop ${APP_NAME}"
echo ""
print_info "Don't forget to:"
echo "- Set up SSL certificate (Let's Encrypt)"
echo "- Configure your domain DNS to point to this server"
echo "- Update environment variables in .env.production"

