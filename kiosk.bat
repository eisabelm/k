@echo off
setlocal enabledelayedexpansion
title VideoStream Kiosk

REM kiosk.bat - show the VideoStream Home Screen fullscreen on the big screen
REM (external monitor) attached to this Windows laptop.
REM
REM It starts the app locally if needed, waits for the Home Screen to respond,
REM then opens Microsoft Edge (or Chrome) in fullscreen kiosk mode.

cd /d "%~dp0"

REM --- Config -------------------------------------------------------------
set "KIOSK_URL=http://localhost:5000/"
REM Horizontal offset of the big screen, used to push the window onto it.
REM   0      = primary / laptop screen
REM   1920   = external monitor to the RIGHT of a 1920-wide laptop
REM   -1920  = external monitor to the LEFT
REM Tip: the most reliable option is to set the big screen as your MAIN display
REM in Windows Settings > System > Display, then leave this at 0.
set "SCREEN_X=0"
set "SCREEN_Y=0"
REM -----------------------------------------------------------------------

REM --- Start the app if nothing is serving on port 5000 ---
netstat -ano | findstr ":5000" >nul 2>&1
if errorlevel 1 (
    echo Starting VideoStream server...
    if not exist node_modules (
        echo Installing dependencies...
        call npm install
    )
    start "VideoStream Server" cmd /c "npm run dev"
) else (
    echo VideoStream server already running on port 5000.
)

REM --- Wait for the Home Screen to respond ---
echo Waiting for %KIOSK_URL% ...
:waitloop
powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing -Uri '%KIOSK_URL%' -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto waitloop
)

REM --- Launch a browser in fullscreen kiosk mode ---
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
set "CHROME86=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"

if exist "%EDGE%" (
    echo Launching Microsoft Edge kiosk...
    start "" "%EDGE%" --kiosk "%KIOSK_URL%" --edge-kiosk-type=fullscreen --no-first-run --window-position=%SCREEN_X%,%SCREEN_Y%
) else if exist "%CHROME%" (
    echo Launching Google Chrome kiosk...
    start "" "%CHROME%" --kiosk "%KIOSK_URL%" --no-first-run --window-position=%SCREEN_X%,%SCREEN_Y%
) else if exist "%CHROME86%" (
    echo Launching Google Chrome kiosk...
    start "" "%CHROME86%" --kiosk "%KIOSK_URL%" --no-first-run --window-position=%SCREEN_X%,%SCREEN_Y%
) else (
    echo Could not find Edge or Chrome. Opening the default browser instead...
    start "" "%KIOSK_URL%"
)

echo.
echo Kiosk launched on the big screen.
echo   - Press Ctrl+W or Alt+F4 to close the kiosk browser.
echo   - Close the "VideoStream Server" window to stop the app.
