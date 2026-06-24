#!/usr/bin/env bash
set -euo pipefail

ADB="${ANDROID_HOME:-$HOME/Library/Android/sdk}/platform-tools/adb"

if ! command -v "$ADB" >/dev/null 2>&1; then
  echo "adb not found; skip port forwarding (set ANDROID_HOME if needed)"
  exit 0
fi

if "$ADB" devices 2>/dev/null | awk 'NR>1 && $2=="device" { found=1 } END { exit !found }'; then
  "$ADB" reverse tcp:8081 tcp:8081 >/dev/null 2>&1 || true
  "$ADB" reverse tcp:3001 tcp:3001 >/dev/null 2>&1 || true
  echo "Android port forwarding: localhost:8081 -> Metro, localhost:3001 -> API"
fi
