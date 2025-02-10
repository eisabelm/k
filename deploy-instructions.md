# Create project directory
cd C:\Users\lebas
mkdir video-stream
cd video-stream

# Verify you're in the correct directory
pwd  # Should show C:\Users\lebas\video-stream
```

## 2. Install Node.js:
- Go to https://nodejs.org/en/download
- Download Windows Installer (.msi) for LTS version
- Run the installer, accepting all defaults
- Check "Automatically install the necessary tools"
- Complete the installation
- Restart your computer

## 3. After restart, verify installation:
- Open PowerShell (not as Administrator)
- Run these commands:
```powershell
node --version  # Should show version like v22.x.x
npm --version   # Should show version like 10.x.x
```

## 4. Build Application
Important: Make sure you're in the correct project directory before running these commands!

```powershell
# First, verify you're in the correct directory
# The directory should contain package.json file
dir package.json  # This should show the package.json file

# If package.json is not found, you need to navigate to the correct directory
cd C:\Users\lebas\video-stream

# Once you confirm you're in the right directory with package.json:
npm install
npm run build
```

## 5. Deploy to Raspberry Pi
```powershell
# Replace raspberrypi with your Pi's IP address if needed
scp -r dist/* kali@raspberrypi:/var/www/html/videos/
scp -r server kali@raspberrypi:/var/www/html/videos/
scp -r shared kali@raspberrypi:/var/www/html/videos/
scp package.json package-lock.json kali@raspberrypi:/var/www/html/videos/
```

## 6. Configure Raspberry Pi
SSH into your Raspberry Pi and run:
```bash
# Install Node.js and npm
sudo apt update
sudo apt install nodejs npm -y

# Install dependencies
cd /var/www/html/videos
npm install --production

# Configure Apache
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

## 7. Set Up Video Directory
```bash
# Run these commands on your Raspberry Pi
sudo mkdir -p /var/www/html/videos/content
sudo chown -R www-data:www-data /var/www/html/videos/content