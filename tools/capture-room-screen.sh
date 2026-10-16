#!/bin/sh
# Re-captures the room's main monitor image from the running local preview.
# Start the preview on port 8092 first. The page is loaded as petu.design so the
# address bar in the image shows the real domain.
set -e
cd "$(dirname "$0")/.."
PROFILE="$(mktemp -d)"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --force-device-scale-factor=1 --window-size=1906,896 \
  --run-all-compositor-stages-before-draw --virtual-time-budget=30000 \
  --host-resolver-rules="MAP petu.design 127.0.0.1:8092" --user-data-dir="$PROFILE" \
  --screenshot="assets/room-desktop-screen.png" http://petu.design/
rm -rf "$PROFILE"
echo "Updated assets/room-desktop-screen.png. Bump its ?v= in workspace-view.js."
