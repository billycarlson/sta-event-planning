#!/usr/bin/env bash
# Usage: run this on the DreamHost server inside the repo directory to pull latest and restart
set -e
echo "Pulling latest changes..."
git pull origin main
echo "Installing dependencies..."
npm install --production
echo "Running migrations..."
npm run migrate || echo "Migration step failed or skipped"
echo "Restarting with pm2..."
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart sta-event-planning || pm2 start server.js --name sta-event-planning
else
  echo "pm2 not found. Start with: npm run start or install pm2 globally: npm i -g pm2"
fi
