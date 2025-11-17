// PM2 Ecosystem Configuration for Greenwood City Website
// Place this file in your application root directory

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

