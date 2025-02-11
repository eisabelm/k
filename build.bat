@echo off
echo Building VideoStream application...

:: Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

:: Clean up previous build
if exist dist (
    echo Cleaning up previous build...
    rd /s /q dist
)

:: Run the build
echo Running build...
npm run build

echo Build complete! Check the dist folder for the output.
pause
