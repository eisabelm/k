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

:: Build the application first
echo Building application...
call npm run build
if errorlevel 1 (
    echo Error: Build failed
    pause
    exit /b 1
)

:: Create deployment package
echo Creating deployment package...
if exist deploy.zip (
    echo Removing existing deploy.zip...
    del /F deploy.zip
)

:: Package files using PowerShell
echo Packaging files into deploy.zip...
powershell -NoProfile -Command "& {Compress-Archive -Path dist,package.json,ecosystem.config.js,videostream.nginx.conf,videostream.service -DestinationPath deploy.zip -Force}"
if errorlevel 1 (
    echo Error: Failed to create deploy.zip
    pause
    exit /b 1
)

:: Verify the package was created
if exist deploy.zip (
    echo Successfully created deploy.zip!
) else (
    echo Error: deploy.zip was not created
    pause
    exit /b 1
)

echo.
echo Deployment package created successfully!
echo.
echo Next steps:
echo 1. Transfer deploy.zip to your Kali machine:
echo    scp deploy.zip kali@192.168.1.46:/home/kali/
echo.
echo 2. On your Kali machine, run these commands:
echo    cd /home/kali
echo    unzip -o deploy.zip -d videostream-temp
echo    sudo cp -r videostream-temp/* /var/www/videostream/
echo    cd /var/www/videostream
echo    sudo npm install
echo    sudo systemctl restart videostream
echo    sudo systemctl status videostream
echo.
echo Press any key to exit...
pause