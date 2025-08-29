#!/usr/bin/env sh
set -e

SNAP_DIR="${SNAP_STORAGE_DIR:-/app/data/snapshots}"

# Make sure the parent exists and is writable for appuser
mkdir -p "$SNAP_DIR"

# If running as root, fix ownership; ignore errors if already owned
if [ "$(id -u)" = "0" ]; then
  chown -R appuser:appuser /app/data || true
  exec gosu appuser:appuser java -Dsnap.storageDir="$SNAP_DIR" -jar /app/app.jar
else
  exec java -Dsnap.storageDir="$SNAP_DIR" -jar /app/app.jar
fi
