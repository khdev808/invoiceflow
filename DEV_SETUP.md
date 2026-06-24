# InvoiceFlow — Dev Environment Setup & Testing Guide

Use this guide to run, test, and debug InvoiceFlow locally on macOS.

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org/) | 20+ (24 works) | All apps |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Latest | PostgreSQL |
| [Xcode](https://developer.apple.com/xcode/) | Latest | iOS Simulator |
| [Android Studio](https://developer.android.com/studio) | Latest | Android Emulator |
| [Expo Go](https://expo.dev/go) | SDK 56 | Quick mobile testing (auto-installed on simulators) |

Optional: [EAS CLI](https://docs.expo.dev/build/setup/) (`npm i -g eas-cli`) for device builds.

## One-time setup

From the repo root (`invoiceflow/`):

```bash
# 1. Install all workspace dependencies
npm install

# 2. Copy API environment file
cp apps/api/.env.example apps/api/.env

# 3. Start Postgres and prepare the database
npm run setup
# Equivalent to:
#   docker compose up -d
#   npm run db:push --workspace=api
#   npm run db:seed --workspace=api
```

### Verify database

```bash
docker compose ps          # postgres should be "Up" on port 5434
```

## Daily development (3 terminals)

Open **three terminals** from the repo root:

### Terminal 1 — API (required for login & data)

```bash
npm run api
```

- URL: http://localhost:3001
- Swagger: http://localhost:3001/api/docs
- Must stay running while testing mobile/admin

### Terminal 2 — Mobile

**iOS Simulator:**

```bash
npm run dev:mobile:ios
```

**Android Emulator** (starts Metro on `localhost` + sets up port forwarding):

```bash
npm run dev:mobile:android
```

**Generic Metro** (scan QR / pick platform manually):

```bash
npm run dev:mobile
```

### Terminal 3 — Admin + Client Portal

```bash
npm run dev:admin
```

- Admin dashboard: http://localhost:3000
- Client portal example: http://localhost:3000/portal/{invoice-id}

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Mobile demo user | `demo@invoiceflow.app` | `demo1234` |
| Admin | `admin@invoiceflow.app` | `Admin123!` |

## Dev / production app variants (mobile)

| Mode | Command | Bundle ID |
|------|---------|-----------|
| **Development** | `APP_VARIANT=development` (default in npm scripts) | `com.kh.everything.qr.dev` |
| **Production** | `APP_VARIANT=production` | `com.kh.everything.qr` |

Scripts: `npm run ios:prod`, `npm run android:prod`, `npm run start:prod` (from `apps/mobile`).

## How the mobile app reaches your API

| Platform | Dev API URL | Notes |
|----------|-------------|-------|
| iOS Simulator | `http://localhost:3001` | Works out of the box |
| Android Emulator | `http://10.0.2.2:3001` | Emulator alias for host machine |
| Physical device | Same LAN IP as Metro | Set `EXPO_PUBLIC_API_URL=http://YOUR_IP:3001` in `apps/mobile/.env` |

`npm run android` also runs `adb reverse` so `localhost:3001` and `localhost:8081` map to your Mac.

## Testing checklist

Run through this after changes to confirm everything works:

### API

- [ ] `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/docs` returns `200`
- [ ] Swagger loads at http://localhost:3001/api/docs
- [ ] Login works: `POST /auth/login` with demo credentials
- [ ] `GET /invoices/dashboard` with Bearer token returns data

### Mobile (Expo Go)

- [ ] App loads without red error screen
- [ ] Login with `demo@invoiceflow.app` / `demo1234` succeeds
- [ ] Dashboard shows revenue stats
- [ ] Create invoice → appears in list
- [ ] Clients tab loads seeded clients
- [ ] More → Settings screens open
- [ ] No persistent "Cannot connect to Expo CLI" toast (Android: use `npm run android`, not manual LAN URL)

### Admin

- [ ] http://localhost:3000 loads
- [ ] Portal page loads for a seeded invoice ID (from DB or mobile app)

### Build verification (CI-style)

```bash
npm run build --workspace=api
npm run build --workspace=admin
cd apps/mobile && npx expo export --platform android
cd apps/mobile && npx expo-doctor
```

## Debugging tips

### Mobile — React Native debugger

1. Shake device / press `m` in Metro terminal → **Open React DevTools**
2. Press `j` in Metro → open Chrome DevTools for Hermes
3. Check Metro logs for bundle errors

### Mobile — API connection errors

If login says **"Cannot reach the API"**:

1. Confirm API terminal shows `InvoiceFlow API running on http://localhost:3001`
2. Confirm Docker Postgres is up: `docker compose ps`
3. Android: run `npm run setup:android --workspace=mobile` then reload app
4. Physical device: set `EXPO_PUBLIC_API_URL` to your Mac's LAN IP

### Android — "Cannot connect to Expo CLI"

Cause: Expo Go opened via LAN IP (`exp://192.168.x.x:8081`) instead of localhost.

**Fix:** Always use `npm run dev:mobile:android` which runs:

```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:3001 tcp:3001
expo start --android --localhost
```

### API — NestJS won't start

If you see `No driver (HTTP) has been selected`:

```bash
npm install   # from repo root — hoists @nestjs/platform-express
```

If Prisma errors appear, regenerate the client:

```bash
npm run db:generate --workspace=api
```

### Database reset

```bash
docker compose down -v    # ⚠️ deletes all data
npm run setup
```

### Prisma Studio (inspect data)

```bash
cd apps/api && npx prisma studio
```

## Useful commands reference

```bash
# Root scripts
npm run setup              # DB + migrations + seed
npm run api                # Start API watch mode
npm run dev:mobile:ios     # iOS + Metro
npm run dev:mobile:android # Android + Metro + adb reverse
npm run dev:admin          # Next.js admin

# Mobile (from apps/mobile)
npm run setup:android      # adb reverse only
npm run start:dev          # Metro (development variant)
npm run start:prod         # Metro (production variant)

# API (from apps/api)
npm run db:push            # Sync schema to DB
npm run db:seed            # Seed demo data
npm run db:generate        # Regenerate Prisma client
```

## Current stack versions

| Layer | Key packages |
|-------|----------------|
| Mobile | Expo SDK 56, React 19.2.7, React Native 0.85.3, Reanimated 4.5 |
| API | NestJS 11.1, Prisma 7.8, PostgreSQL 16 |
| Admin | Next.js 16.2, React 19.2.7, Tailwind 4 |

## EAS builds (optional)

Project: `@khdev4678/invoiceflow` on Expo.

```bash
cd apps/mobile
npm run build:dev:ios
npm run build:dev:android
npm run build:prod:ios
npm run build:prod:android
```

Use EAS development builds for **Android push notifications** (not supported in Expo Go SDK 53+).
