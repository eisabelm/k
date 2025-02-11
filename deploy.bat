@echo off
echo Starting VideoStream Deployment...

:: Check if we're in the right directory
if not exist "package.json" (
    echo Error: Please run this script from the project root directory
    echo The directory should contain package.json and other project files
    echo.
    pause
    exit /b 1
)

:: Build the application
echo Building application...
npm run build

:: Create deployment package
echo Creating deployment package...
if exist deploy.zip del /F deploy.zip
powershell Compress-Archive -Path dist\*, ecosystem.config.js, videostream.nginx.conf, videostream.service -DestinationPath deploy.zip

echo Deployment package created: deploy.zip
echo.
echo To deploy to your Kali Linux machine:
echo 1. Transfer deploy.zip to your Kali machine using scp:
echo    scp deploy.zip kali@your-raspberry-pi:/home/kali/
echo.
echo 2. On your Kali machine, run:
echo    cd /home/kali
echo    unzip deploy.zip -d videostream-temp
echo    sudo cp videostream-temp/videostream.nginx.conf /etc/nginx/sites-available/videostream
echo    sudo cp videostream-temp/videostream.service /etc/systemd/system/
echo    sudo cp -r videostream-temp/* /var/www/videostream/
echo    rm -rf videostream-temp
echo.
pause