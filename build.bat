@echo off
echo Building VideoStream application...

:: Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

:: Clean up previous build
if exist dist (
    echo Cleaning up previous build...
    rd /s /q dist
)

:: Run the build
echo Running build...
call npm run build

if errorlevel 1 (
    echo Build failed! Please check the error messages above.
    pause
    exit /b 1
)

echo Build complete! Check the dist folder for the output.
pause