#!/usr/bin/env bash
# Used by Render cron to keep free-tier web services awake.
set -euo pipefail

API_URL="${KEEPALIVE_API_URL:-https://invoiceflow-api-v1td.onrender.com/health}"
ADMIN_URL="${KEEPALIVE_ADMIN_URL:-https://invoiceflow-admin.onrender.com/}"

ping_url() {
  local name="$1"
  local url="$2"
  local attempt code

  for attempt in 1 2 3 4 5 6; do
    echo "==> ${name} attempt ${attempt}/6"
    code="$(curl -sS --connect-timeout 20 --max-time 120 -o /dev/null -w "%{http_code}" "$url" || true)"
    if [ "$code" = "200" ]; then
      echo "${name} ok (HTTP ${code})"
      return 0
    fi
    echo "${name} returned HTTP ${code:-000}, waiting 20s..."
    sleep 20
  done

  echo "${name} failed after retries"
  return 1
}

ping_url "API" "$API_URL"
ping_url "Admin" "$ADMIN_URL"
