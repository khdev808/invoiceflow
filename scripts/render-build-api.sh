#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Installing dependencies (including devDependencies for Nest build)"
npm ci --include=dev

echo "==> Generating Prisma client"
export DATABASE_URL="${DATABASE_URL:-postgresql://placeholder:placeholder@localhost:5432/placeholder}"
npm run db:generate --workspace=api

echo "==> Building API"
npm run build --workspace=api

echo "==> Running database migrations"
cd apps/api
if [ -z "${DATABASE_URL:-}" ]; then
  echo "WARNING: DATABASE_URL not set — skipping migrate deploy (link invoiceflow-db in Render dashboard)"
else
  npx prisma migrate deploy
fi

echo "==> API build complete"
