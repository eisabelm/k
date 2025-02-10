node --version
npm --version
```

## 2. Build the Application (On Windows)
```powershell
# Navigate to your project directory (where package.json is located)
cd path\to\your\project

# Install dependencies
npm install

# Build the application
npm run build
```

## 3. Deploy to Raspberry Pi
After the build is complete, open PowerShell and copy files to Raspberry Pi:
```powershell
# Replace raspberrypi with your Pi's IP address if needed
scp -r dist/* kali@raspberrypi:/var/www/html/videos/
scp -r server kali@raspberrypi:/var/www/html/videos/
scp -r shared kali@raspberrypi:/var/www/html/videos/
scp package.json package-lock.json kali@raspberrypi:/var/www/html/videos/
```

## 4. Configure Raspberry Pi
SSH into your Raspberry Pi and run:
```bash
# Install Node.js and npm
sudo apt update
sudo apt install nodejs npm -y

# Install dependencies
cd /var/www/html/videos
npm install --production

# Configure Apache
sudo nano /etc/apache2/sites-available/videos.conf
```

Add this Apache configuration:
```apache
<VirtualHost *:80>
    ServerName raspberrypi
    DocumentRoot /var/www/html/videos

    ProxyPreserveHost On
    ProxyPass /api http://localhost:5000/api
    ProxyPassReverse /api http://localhost:5000/api

    <Directory /var/www/html/videos>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Enable Apache configuration:
```bash
sudo a2ensite videos.conf
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl restart apache2

# Install and configure PM2
sudo npm install -g pm2
cd /var/www/html/videos
pm2 start server/index.js --name "video-stream"
pm2 save
pm2 startup
```

## 5. Set Up Video Directory
Create a directory for your video files:
```bash
# Run these commands on your Raspberry Pi
sudo mkdir -p /var/www/html/videos/content
sudo chown -R www-data:www-data /var/www/html/videos/content