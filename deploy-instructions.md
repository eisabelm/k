npm run build
```

## 2. Create Directory Structure on Raspberry Pi
SSH into your Raspberry Pi and create the necessary directories:
```bash
sudo mkdir -p /var/www/html/videos
sudo chown -R kali:kali /var/www/html/videos
```

## 3. Copy Files to Raspberry Pi
From your development machine, copy the built files to the Raspberry Pi (run these commands on your development machine):
```bash
# Replace raspberrypi with your Pi's IP address if needed
scp -r dist/* kali@raspberrypi:/var/www/html/videos/
scp -r server kali@raspberrypi:/var/www/html/videos/
scp -r shared kali@raspberrypi:/var/www/html/videos/
scp package.json package-lock.json kali@raspberrypi:/var/www/html/videos/
```

## 4. Install Dependencies on Raspberry Pi
On your Raspberry Pi:
```bash
cd /var/www/html/videos
npm install --production
```

## 5. Configure Apache2
Create a new Apache configuration file:
```bash
sudo nano /etc/apache2/sites-available/videos.conf
```

Add this configuration:
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

Enable the site and required modules:
```bash
sudo a2ensite videos.conf
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl restart apache2
```

## 6. Start the Node.js Server
Install PM2 to manage the Node.js process:
```bash
sudo npm install -g pm2
```

Start the server:
```bash
cd /var/www/html/videos
pm2 start server/index.js --name "video-stream"
pm2 save
pm2 startup
```

## 7. Set Up Video Directory
Create a directory for your video files:
```bash
sudo mkdir -p /var/www/html/videos/content
sudo chown -R www-data:www-data /var/www/html/videos/content