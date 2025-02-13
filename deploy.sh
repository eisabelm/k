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

# Create and configure systemd service for the Node.js backend
echo "Configuring systemd service..."
sudo cp videostream.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable videostream
sudo systemctl restart videostream

# Configure Apache
echo "Configuring Apache..."
# Enable required Apache modules
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo a2enmod rewrite

sudo cp ccrccgame.org.conf /etc/apache2/sites-available/
sudo a2ensite ccrccgame.org.conf
sudo systemctl restart apache2

echo "Deployment complete!"
echo "Please ensure DNS is configured in Cloudflare for ccrccgame.org"
echo "Frontend will be served at: http://ccrccgame.org"
echo "Backend is running on port 5000"

# Verify deployment
echo -e "\nVerifying deployment..."

# Check if Apache is running
echo "Checking Apache status..."
if ! systemctl is-active --quiet apache2; then
    echo "ERROR: Apache is not running!"
    echo "Try: sudo systemctl start apache2"
    exit 1
fi

# Check if videostream service is running
echo "Checking videostream service status..."
if ! systemctl is-active --quiet videostream; then
    echo "ERROR: Videostream service is not running!"
    echo "Try: sudo systemctl start videostream"
    systemctl status videostream
    exit 1
fi

# Check if backend is responding
echo "Checking backend API..."
if ! curl -s --head http://localhost:5000/api > /dev/null; then
    echo "ERROR: Backend API is not responding!"
    echo "Check logs: tail -f /var/www/videostream/logs/err.log"
    tail -n 50 /var/www/videostream/logs/err.log
    exit 1
fi

# Check frontend files
echo "Checking frontend files..."
if [ ! -f "/var/www/html/ccrccgame/index.html" ]; then
    echo "ERROR: Frontend files not found!"
    echo "Check if the build process completed successfully"
    exit 1
fi

# Check log files exist and are writable
echo "Checking log files..."
if [ ! -w "/var/www/videostream/logs/err.log" ]; then
    echo "ERROR: Log files are not writable!"
    echo "Try: sudo chown -R kali:kali /var/www/videostream/logs"
    ls -la /var/www/videostream/logs/
    exit 1
fi

# Check Apache configuration syntax
echo "Checking Apache configuration..."
if ! apache2ctl -t; then
    echo "ERROR: Apache configuration is invalid!"
    echo "Check: /etc/apache2/sites-available/ccrccgame.org.conf"
    exit 1
fi

echo -e "\nAll checks passed! Your site should be ready at https://ccrccgame.org"
echo "Please follow the instructions in CLOUDFLARE_SETUP.md to complete the DNS and SSL configuration"