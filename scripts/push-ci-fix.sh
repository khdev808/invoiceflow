#!/usr/bin/env bash
set -euo pipefail

echo "GitHub needs the workflow scope to publish CI fixes."
echo "Run: gh auth refresh -h github.com -s workflow"
echo "Then approve the browser prompt and re-run this script."
echo

if ! gh auth status 2>&1 | grep -q workflow; then
  gh auth refresh -h github.com -s workflow
fi

cd "$(dirname "$0")/.."
git push origin main
gh workflow enable keepalive.yml -R khdev808/invoiceflow || true
gh workflow run keepalive.yml -R khdev808/invoiceflow
echo "Pushed. Check: gh run list -R khdev808/invoiceflow --limit 3"
