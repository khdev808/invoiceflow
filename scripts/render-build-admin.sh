#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Installing dependencies"
npm ci

echo "==> Building admin (Next.js)"
npm run build --workspace=admin

echo "==> Admin build complete"
