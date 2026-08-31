#!/bin/bash
# ==============================================================================
# AWS EC2 Automated Deployment Script for Student Management & Analytics System
# Target Server: Ubuntu 24.04 LTS (13.232.248.71)
# ==============================================================================

set -e

echo "=== 1. Updating System Packages ==="
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl git nginx build-essential postgresql-client

echo "=== 2. Installing Node.js 20.x LTS ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v

echo "=== 3. Installing Global Process Manager (PM2) ==="
sudo npm install -g pm2

echo "=== 4. Setting Up Application Directory ==="
sudo mkdir -p /var/www/student-management
sudo chown -R ubuntu:ubuntu /var/www/student-management
cd /var/www/student-management

# Copy or pull latest codebase
echo "Setting up backend..."
cd backend
npm install --production
pm2 stop student-api || true
pm2 start server.js --name "student-api" -i max
pm2 save
pm2 startup systemd || true

echo "=== 5. Building React Frontend ==="
cd ../frontend
npm install
npm run build

echo "=== 6. Configuring Nginx Reverse Proxy ==="
sudo cp ../infrastructure/ec2/nginx.conf /etc/nginx/sites-available/student-management
sudo ln -sf /etc/nginx/sites-available/student-management /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "=================================================================="
echo " Deployment Successfully Completed!"
echo " Web Application URL: http://13.232.248.71"
echo " Backend API Health:  http://13.232.248.71/api/health"
echo "=================================================================="
