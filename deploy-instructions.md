# Deployment Instructions for Raspberry Pi Apache2 Server

## 1. Build the Application
On your development machine, run:
```bash
npm run build
```
This will create a production build in the `dist` folder.

## 2. Copy Files to Raspberry Pi
Copy the following files/folders to your Raspberry Pi:
- `dist/` directory → `/var/www/html/videos/`
- `server/` directory → `/var/www/html/videos/server/`
- `shared/` directory → `/var/www/html/videos/shared/`
- `package.json` and `package-lock.json` → `/var/www/html/videos/`

## 3. Install Dependencies on Raspberry Pi
In the `/var/www/html/videos` directory, run:
```bash
npm install --production
```

## 4. Configure Apache2
Create a new Apache configuration file `/etc/apache2/sites-available/videos.conf`:

```apache
<VirtualHost *:80>
    ServerName your-domain-or-ip
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

## 5. Start the Node.js Server
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

## 6. Set Up Video Directory
Create a directory for your video files:
```bash
sudo mkdir -p /var/www/html/videos/content
sudo chown -R www-data:www-data /var/www/html/videos/content
```

The application should now be accessible at `http://your-raspberry-pi-ip/videos`
