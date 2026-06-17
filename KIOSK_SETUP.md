# Kiosk Setup — Home Screen on the Big-Screen Display

This shows the VideoStream **Home Screen** fullscreen on the monitor attached to
the Raspberry Pi (kiosk mode), so the big screen boots straight into the app.

## What's included

- `kiosk.sh` — launches Chromium in fullscreen kiosk mode pointing at the
  locally served Home Screen (`http://localhost/` by default).
- `videostream-kiosk.service` — systemd service that runs `kiosk.sh` in the
  graphical session and keeps it alive (restarts if it crashes).
- `deploy.sh` installs and enables both automatically.

## Prerequisites

The Pi must have a desktop/X session and Chromium:

```bash
sudo apt-get update
sudo apt-get install -y chromium       # or chromium-browser on Raspberry Pi OS
sudo apt-get install -y unclutter      # optional: hides the mouse cursor
```

The kiosk needs a logged-in graphical session on the attached display
(`DISPLAY=:0`). On a headless image, enable desktop autologin first
(`sudo raspi-config` → *System Options* → *Boot / Auto Login* → *Desktop
Autologin*).

## Install

Running `./deploy.sh` installs the kiosk alongside the app. To set it up by hand:

```bash
sudo cp kiosk.sh /var/www/videostream/
sudo chmod +x /var/www/videostream/kiosk.sh
sudo cp videostream-kiosk.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable videostream-kiosk
sudo systemctl restart videostream-kiosk
```

The screen should switch to the fullscreen Home Screen within a few seconds.

## Configuration

- **Which page is shown:** set `KIOSK_URL` in `videostream-kiosk.service`
  (default `http://localhost/`). For example, point it at a specific video with
  `Environment=KIOSK_URL=http://localhost/video/1`.
- **Different user/home:** the service runs as `kali` and reads
  `/home/kali/.Xauthority`. Update `User=`, `XAUTHORITY=`, and the
  `PROFILE_DIR`/home path if your Pi uses a different account.

After editing the unit, run `sudo systemctl daemon-reload && sudo systemctl
restart videostream-kiosk`.

## Verify / troubleshoot

```bash
sudo systemctl status videostream-kiosk      # is the kiosk running?
journalctl -u videostream-kiosk -f           # live logs
```

- **Black screen / "cannot open display":** the graphical session isn't running
  or `XAUTHORITY` is wrong. Confirm the desktop is logged in and the path
  matches the active user's home.
- **Chromium not found:** install it (see Prerequisites); `kiosk.sh` looks for
  both `chromium-browser` and `chromium`.
- **Shows an error page on boot:** `kiosk.sh` waits for `KIOSK_URL` to respond
  before launching, so make sure Apache (`apache2`) and the backend
  (`videostream`) are up — `systemctl status apache2 videostream`.

## Alternative: desktop autostart (no systemd)

If you'd rather start the kiosk from the desktop session instead of systemd,
add an autostart entry as the `kali` user:

```bash
mkdir -p ~/.config/autostart
cat > ~/.config/autostart/videostream-kiosk.desktop <<'EOF'
[Desktop Entry]
Type=Application
Name=VideoStream Kiosk
Exec=/var/www/videostream/kiosk.sh
X-GNOME-Autostart-enabled=true
EOF
```

Use one approach or the other, not both, to avoid two browser instances.
