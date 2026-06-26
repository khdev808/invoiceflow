#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Installing dependencies (including devDependencies for Next.js build)"
corepack enable
pnpm install --frozen-lockfile

echo "==> Building admin (Next.js)"
pnpm -F admin build

echo "==> Admin build complete"
