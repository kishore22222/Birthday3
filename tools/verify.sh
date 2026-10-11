#!/usr/bin/env bash
# Throwaway verification runner: serves dist/, drives headless Chrome, shoots.
# Invoked as `bash tools/verify.sh` so the whole pipeline is one short command.
set -u

cd "$(dirname "$0")/.." || exit 1
PORT="${PORT:-5175}"
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
PROFILE="${TEMP:-/tmp}/nija-shoot"

echo "=== build ==="
npm run build 2>&1 | tail -6

echo "=== start preview on $PORT ==="
(npx vite preview --port "$PORT" --strictPort > preview.log 2>&1 &)

echo "=== start headless chrome ==="
("$CHROME" --headless=new --remote-debugging-port=9222 \
  --user-data-dir="$PROFILE" --no-first-run --no-default-browser-check \
  --disable-gpu --hide-scrollbars about:blank > chrome.log 2>&1 &)

for _ in $(seq 1 20); do
  sleep 1
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/" 2>/dev/null || echo 000)
  cdp=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:9222/json/version 2>/dev/null || echo 000)
  if [ "$code" = "200" ] && [ "$cdp" = "200" ]; then
    echo "server=$code cdp=$cdp (after ${_}s)"
    break
  fi
done

echo "=== server log ==="
tail -5 preview.log 2>/dev/null
echo "=== chrome log ==="
tail -5 chrome.log 2>/dev/null

echo "=== shots ==="
SHOOT_ORIGIN="http://localhost:$PORT/" node --experimental-websocket tools/shoot.mjs 2>&1 | tail -30

echo "=== result ==="
ls -1 .shots 2>/dev/null | tail -25
