#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Installing dependencies"
npm ci

echo "==> Generating Prisma client"
npm run db:generate --workspace=api

echo "==> Building API"
npm run build --workspace=api

echo "==> Running database migrations"
cd apps/api
npx prisma migrate deploy

echo "==> API build complete"
