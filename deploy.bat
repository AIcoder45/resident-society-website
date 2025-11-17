@echo off
REM Greenwood City Website - Windows Deployment Script
REM Run this from PowerShell or CMD

set VPS_IP=31.97.232.51
set VPS_USER=root
set APP_NAME=greenwood-city
set APP_DIR=/var/www/greenwood-city
set GIT_REPO=https://github.com/AIcoder45/resident-society-website.git
set DOMAIN=greenwoodscity.in
set PORT=3000

echo ==========================================
echo Greenwood City Website - VPS Deployment
echo ==========================================
echo.

echo Testing SSH connection...
ssh -o ConnectTimeout=5 -o BatchMode=yes %VPS_USER%@%VPS_IP% exit 2>nul
if errorlevel 1 (
    echo ERROR: Cannot connect to %VPS_USER%@%VPS_IP%
    echo Please ensure SSH is configured correctly
    pause
    exit /b 1
)

echo SSH connection successful!
echo.
echo Deploying to VPS...
echo.

ssh %VPS_USER%@%VPS_IP% "bash -s" << "ENDSSH"
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

echo "→ Updating system packages..."
apt-get update -y > /dev/null 2>&1
apt-get upgrade -y > /dev/null 2>&1
echo "✓ System updated"

echo "→ Installing Node.js ${NODE_VERSION}..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - > /dev/null 2>&1
    apt-get install -y nodejs > /dev/null 2>&1
    echo "✓ Node.js installed"
else
    echo "✓ Node.js already installed: $(node -v)"
fi

echo "→ Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2 > /dev/null 2>&1
    pm2 startup systemd -u root --hp /root > /dev/null 2>&1 || true
    echo "✓ PM2 installed"
else
    echo "✓ PM2 already installed"
fi

echo "→ Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx > /dev/null 2>&1
    systemctl enable nginx > /dev/null 2>&1
    echo "✓ Nginx installed"
else
    echo "✓ Nginx already installed"
fi

echo "→ Installing Git and build tools..."
apt-get install -y git build-essential python3 > /dev/null 2>&1
echo "✓ Build tools installed"

echo "→ Configuring firewall..."
if ! command -v ufw &> /dev/null; then
    apt-get install -y ufw > /dev/null 2>&1
fi
ufw allow 22/tcp > /dev/null 2>&1 || true
ufw allow 80/tcp > /dev/null 2>&1 || true
ufw allow 443/tcp > /dev/null 2>&1 || true
ufw --force enable > /dev/null 2>&1 || true
echo "✓ Firewall configured"

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

mkdir -p ${APP_DIR}/logs
chown -R www-data:www-data ${APP_DIR} > /dev/null 2>&1 || true

echo "→ Installing dependencies..."
cd ${APP_DIR}
npm install > /dev/null 2>&1
echo "✓ Dependencies installed"

echo "→ Building application..."
npm run build > /dev/null 2>&1
echo "✓ Application built"

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

ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t > /dev/null 2>&1
systemctl reload nginx > /dev/null 2>&1
echo "✓ Nginx configured"

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
echo ""
ENDSSH

echo.
echo ==========================================
echo Deployment completed!
echo ==========================================
echo.
echo Your website should be available at:
echo   http://%DOMAIN%
echo.
echo To complete setup:
echo   1. SSH to server: ssh %VPS_USER%@%VPS_IP%
echo   2. Create .env.production: cd %APP_DIR% ^&^& nano .env.production
echo   3. Setup SSL: certbot --nginx -d %DOMAIN% -d www.%DOMAIN%
echo.
pause

