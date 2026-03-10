#!/bin/bash
# ─── STARK ELITE — START V99 PROXY ──────────────────────────────────────
# Run from terminal: bash start_proxy.sh

cd "$(dirname "$0")/proxy"

# Load .env if present
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

echo "Starting Stark Elite Live Data Proxy on port ${PORT:-3001}..."
node server.js
