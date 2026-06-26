#!/usr/bin/env bash
# Provision InvoiceFlow web services on Render (run after GitHub is connected).
set -euo pipefail

WORKSPACE_ID="${RENDER_WORKSPACE_ID:-tea-d8u7gr3tqb8s73atnqn0}"
ENV_ID="${RENDER_ENV_ID:-evm-d8u7oi5aeets738mjkh0}"
REPO="${RENDER_REPO:-https://github.com/khdev808/invoiceflow}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"

render workspace set "$WORKSPACE_ID"

echo "==> Validating blueprint / GitHub access"
if ! render blueprints validate render.yaml | python3 -c "import sys,json; d=json.load(sys.stdin); errs=[e for e in d.get('errors',[]) if 'branch' in e.get('error','') or 'repo' in e.get('error','')]; sys.exit(0 if not errs else 1)"; then
  echo ""
  echo "GitHub repo is not reachable by Render yet."
  echo "Fix:"
  echo "  1. Push code: git push origin main"
  echo "  2. Render Dashboard → Account Settings → GitHub → grant access to khdev808/invoiceflow"
  echo "  3. Re-run: bash scripts/render-provision.sh"
  exit 1
fi

echo "==> Creating invoiceflow-api (if missing)"
if ! render services -o json | python3 -c "import sys,json; s=json.load(sys.stdin); print(any(x.get('service',{}).get('name')=='invoiceflow-api' for x in s))" 2>/dev/null | grep -q True; then
  render services create \
    --name invoiceflow-api \
    --type web_service \
    --runtime node \
    --region ohio \
    --plan free \
    --environment-id "$ENV_ID" \
    --repo "$REPO" \
    --branch main \
    --build-command "pnpm run render:build:api" \
    --start-command "pnpm run render:start:api" \
    --health-check-path /health \
    --env-var NODE_ENV=production \
    --env-var JWT_SECRET="$JWT_SECRET" \
    --confirm -o json
fi

echo "==> Creating invoiceflow-admin (if missing)"
if ! render services -o json | python3 -c "import sys,json; s=json.load(sys.stdin); print(any(x.get('service',{}).get('name')=='invoiceflow-admin' for x in s))" 2>/dev/null | grep -q True; then
  render services create \
    --name invoiceflow-admin \
    --type web_service \
    --runtime node \
    --region ohio \
    --plan free \
    --environment-id "$ENV_ID" \
    --repo "$REPO" \
    --branch main \
    --build-command "pnpm run render:build:admin" \
    --start-command "pnpm run render:start:admin" \
    --health-check-path / \
    --env-var NODE_ENV=production \
    --confirm -o json
fi

echo ""
echo "Done. Link invoiceflow-db to invoiceflow-api in the Render dashboard:"
echo "  invoiceflow-api → Environment → Link Database → invoiceflow-db"
echo ""
echo "Then set NEXT_PUBLIC_API_URL on admin to the API external URL and redeploy both."
