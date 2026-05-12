#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if [ "$1" = "build" ]; then
  npm run build:backend
  npm run build:frontend
  exit 0
fi

APP="${APP:-frontend}"
if [ "$APP" = "backend" ]; then
  cd Backend
else
  cd Frontend
fi
exec npm run start
