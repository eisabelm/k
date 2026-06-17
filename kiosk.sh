#!/bin/bash
# kiosk.sh — display the VideoStream Home Screen fullscreen on the attached
# monitor (Raspberry Pi big-screen / kiosk mode).
#
# Launches Chromium in kiosk mode pointing at the locally served Home Screen.
# Intended to be run inside the graphical session (see videostream-kiosk.service).

set -e

# URL of the Home Screen to show. Apache serves the SPA at port 80, so the app's
# home page lives at the site root. Override with the KIOSK_URL env var if needed.
KIOSK_URL="${KIOSK_URL:-http://localhost/}"

# Target the locally attached display.
export DISPLAY="${DISPLAY:-:0}"

# Pick whichever Chromium binary is installed (Raspberry Pi OS ships
# "chromium-browser"; Kali/Debian ship "chromium").
CHROMIUM_BIN="$(command -v chromium-browser || command -v chromium || true)"
if [ -z "$CHROMIUM_BIN" ]; then
  echo "ERROR: Chromium is not installed." >&2
  echo "Install it with: sudo apt-get install -y chromium" >&2
  exit 1
fi

# Keep the screen awake: disable blanking and power management.
if command -v xset >/dev/null 2>&1; then
  xset s off || true
  xset -dpms || true
  xset s noblank || true
fi

# Hide the mouse cursor when idle (optional, only if unclutter is installed).
if command -v unclutter >/dev/null 2>&1; then
  unclutter -idle 0.5 -root &
fi

# Wait for the Home Screen to be reachable before opening the browser, so the
# kiosk doesn't flash an error page if it starts before Apache/the backend.
echo "Waiting for $KIOSK_URL to become available..."
until curl -s --head "$KIOSK_URL" >/dev/null; do
  sleep 2
done

# Use a dedicated profile so we can suppress "restore pages" prompts.
PROFILE_DIR="${HOME}/.config/videostream-kiosk"
mkdir -p "$PROFILE_DIR"

echo "Launching kiosk at $KIOSK_URL on display $DISPLAY"
exec "$CHROMIUM_BIN" \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-features=TranslateUI \
  --check-for-update-interval=31536000 \
  --autoplay-policy=no-user-gesture-required \
  --user-data-dir="$PROFILE_DIR" \
  --app="$KIOSK_URL"
