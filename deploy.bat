@echo off
echo Starting VideoStream Deployment...

:: Build the application
echo Building application...
npm run build

:: Create deployment package
echo Creating deployment package...
if exist deploy.zip del /F deploy.zip
powershell Compress-Archive -Path dist\*, ecosystem.config.js -DestinationPath deploy.zip

echo Deployment package created: deploy.zip
echo.
echo To deploy to your Raspberry Pi:
echo 1. Copy deploy.zip to your Raspberry Pi
echo 2. On your Raspberry Pi, run:
echo    unzip deploy.zip -d videostream
echo    cd videostream
echo    npm install --production
echo    pm2 start ecosystem.config.js
echo.
pause
