#!/bin/bash
# Deploy script for ccrccgame.org on Raspberry Pi

# Exit on any error
set -e

echo "Starting deployment process..."

# Build the application
echo "Building application..."
npm run build

# Create deployment directories if they don't exist
echo "Setting up directories..."
sudo mkdir -p /var/www/html/ccrccgame
sudo mkdir -p /var/www/videostream
sudo mkdir -p /var/www/videostream/logs

# Copy built files to Apache directory
echo "Copying frontend files..."
sudo cp -r dist/* /var/www/html/ccrccgame/

# Copy backend files
echo "Setting up backend..."
sudo cp -r dist/server/* /var/www/videostream/
sudo cp package.json /var/www/videostream/
sudo cp package-lock.json /var/www/videostream/

# Install production dependencies for backend
echo "Installing backend dependencies..."
cd /var/www/videostream
sudo npm ci --production

# Set proper permissions
echo "Setting permissions..."
sudo chown -R www-data:www-data /var/www/html/ccrccgame
sudo chmod -R 755 /var/www/html/ccrccgame
sudo chown -R kali:kali /var/www/videostream
sudo chmod -R 755 /var/www/videostream
sudo chown -R kali:kali /var/www/videostream/logs
sudo chmod -R 755 /var/www/videostream/logs

# Create and configure systemd service
echo "Configuring systemd service..."
sudo cp videostream.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable videostream
sudo systemctl restart videostream

# Configure Apache
echo "Configuring Apache..."
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo a2enmod rewrite

sudo cp ccrccgame.org.conf /etc/apache2/sites-available/
sudo a2ensite ccrccgame.org.conf
sudo systemctl restart apache2

echo "Deployment complete!"
