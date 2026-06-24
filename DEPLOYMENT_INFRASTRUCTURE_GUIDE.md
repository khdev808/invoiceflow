# InvoiceFlow — Deployment, Hosting & Cost Guide

**Date:** June 2026  
**Purpose:** Step-by-step production setup — recommended hosting/database, initial cost plan, and **manual** Expo mobile builds (no EAS Production required).

**Related docs:** [PRODUCTION_LAUNCH_PLAN.md](./PRODUCTION_LAUNCH_PLAN.md) · [DEV_SETUP.md](./DEV_SETUP.md) · [PRODUCT_LAUNCH_REPORT.md](./PRODUCT_LAUNCH_REPORT.md)

---

## Table of Contents

1. [Recommended Stack (Summary)](#1-recommended-stack-summary)
2. [Initial Cost Plan](#2-initial-cost-plan)
3. [Database Setup — Neon](#3-database-setup--neon)
4. [API Hosting — Render](#4-api-hosting--render)
5. [Admin & Portal — Vercel](#5-admin--portal--vercel)
6. [Email — Resend](#6-email--resend)
7. [DNS & Domains](#7-dns--domains)
8. [Manual Expo Production Builds](#8-manual-expo-production-builds)
9. [Store Submission (Without EAS Submit)](#9-store-submission-without-eas-submit)
10. [Alternative Stack — Railway](#10-alternative-stack--railway)
11. [Cost Scaling Scenarios](#11-cost-scaling-scenarios)
12. [Checklist](#12-checklist)

---

## 1. Recommended Stack (Summary)

This is the **most cost-effective** setup for InvoiceFlow’s architecture (NestJS API, Prisma/Postgres, Next.js admin, Expo mobile).

```
┌─────────────────────────────────────────────────────────────┐
│                        PRODUCTION                            │
├─────────────────────────────────────────────────────────────┤
│  Mobile app     │  Local builds (Xcode / Gradle) → stores   │
│  API            │  Render Web Service — $7/mo               │
│  Database       │  Neon Postgres — $0 → $19/mo              │
│  Admin + portal │  Vercel Hobby — $0                        │
│  Email          │  Resend — $0 (3k/mo)                      │
│  Monitoring     │  Sentry free tier — $0                    │
│  Domains        │  invoiceflow.app — ~$12–40/yr             │
│  App stores     │  Apple $99/yr + Google $25 one-time       │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Service | Why this one |
|-------|---------|--------------|
| **Database** | [Neon](https://neon.tech) | Managed Postgres, Prisma-compatible, free tier for beta, cheap paid tier |
| **API** | [Render](https://render.com) | Always-on Node ($7/mo), fits NestJS + cron jobs, simple monorepo deploy |
| **Admin** | [Vercel](https://vercel.com) | Best Next.js hosting, free Hobby tier, preview deploys |
| **Email** | [Resend](https://resend.com) | Simple SMTP for invoice send + reminders, generous free tier |
| **Mobile builds** | **Local** (`expo prebuild` + Xcode/Gradle) | $0 build fees; EAS optional |

**Why not serverless (Vercel/Netlify) for the API?**  
InvoiceFlow runs scheduled jobs (`@nestjs/schedule`). You need a **long-running** process, not ephemeral functions.

**Why Neon over Render Postgres?**  
Neon’s free tier and $19 Launch plan are better value than Render Postgres ($7+) for early-stage Postgres-only needs.

---

## 2. Initial Cost Plan

### 2.1 One-time costs (before / at launch)

| Item | Cost (USD) | Notes |
|------|------------|-------|
| Google Play Console | **$25** | One-time registration |
| Apple Developer Program | **$99/year** | Required for App Store |
| Domain (`invoiceflow.app`) | **$12–40/year** | Depends on registrar |
| Android upload keystore | **$0** | You generate it locally |
| **Total one-time (year 1)** | **~$136–164** | Excludes optional design assets |

### 2.2 Monthly costs — Phase 1: Beta (months 1–2)

| Service | Plan | Monthly |
|---------|------|---------|
| Neon Postgres | Free | **$0** |
| Render API | Starter (512MB) | **$7** |
| Vercel Admin | Hobby | **$0** |
| Resend | Free (3,000 emails/mo) | **$0** |
| Sentry | Developer free | **$0** |
| EAS Build | **Not used** (manual builds) | **$0** |
| Uptime monitoring | UptimeRobot free | **$0** |
| **Phase 1 total** | | **~$7/mo** |

### 2.3 Monthly costs — Phase 2: Public launch (months 3–6)

| Service | Plan | Monthly |
|---------|------|---------|
| Neon Postgres | Launch | **$19** |
| Render API | Starter | **$7** |
| Vercel Admin | Hobby | **$0** |
| Resend | Free or Pro | **$0–20** |
| Sentry | Free | **$0** |
| **Phase 2 total** | | **~$26–46/mo** |

### 2.4 Monthly costs — Phase 3: Growth (500+ paid users)

| Service | Plan | Monthly |
|---------|------|---------|
| Neon Postgres | Scale | **$69** |
| Render API | Standard (1GB+) | **$25** |
| Vercel Admin | Pro (if needed) | **$20** |
| Resend | Pro | **$20** |
| Sentry | Team | **$26** |
| **Phase 3 total** | | **~$160/mo** |

### 2.5 Year 1 cash-out summary (bootstrap path)

| Category | Low estimate | High estimate |
|----------|--------------|---------------|
| Store + domain (one-time) | $136 | $164 |
| Infra months 1–2 @ $7 | $14 | $14 |
| Infra months 3–12 @ $26 avg | $260 | $460 |
| Marketing (optional) | $0 | $3,000 |
| **Year 1 total** | **~$410** | **~$3,640** |

### 2.6 Break-even vs infrastructure

| Monthly infra | Pro subs needed @ $9.99/mo |
|---------------|----------------------------|
| $7 (beta) | **1** paying user |
| $26 (launch) | **3** paying users |
| $46 (launch + email) | **5** paying users |
| $160 (growth) | **16** paying users |

*Stripe/Apple fees on subscription revenue are separate from infra OPEX.*

---

## 3. Database Setup — Neon

### 3.1 Create project

1. Sign up at [neon.tech](https://neon.tech)
2. **New project** → name: `invoiceflow-prod`
3. Region: **US East (Ohio)** or **US West** (match Render region)
4. Postgres version: **16** (or latest stable)

### 3.2 Connection string

Copy the pooled connection string (recommended for serverless-style connection pooling):

```
postgresql://USER:PASSWORD@ep-xxx.us-east-2.aws.neon.tech/invoiceflow?sslmode=require
```

Add to Render as `DATABASE_URL`.

### 3.3 Prisma migrations (production)

Before first deploy, create an initial migration locally:

```bash
cd apps/api

# Point at Neon (use a branch or direct URL for first migration)
export DATABASE_URL="postgresql://..."

npx prisma migrate dev --name init
```

In production deploys, use:

```bash
npx prisma migrate deploy
```

> **Do not** run `db:seed` in production — it creates demo users. Create a single admin via a one-off script or SQL.

### 3.4 Backups

- Neon Launch+ includes point-in-time recovery
- On free tier: export weekly with `pg_dump` via GitHub Action (optional)

### 3.5 Preview databases (optional)

Neon **branches** give you a copy of schema for PR previews — useful when admin/API preview deploys need a DB.

---

## 4. API Hosting — Render

### 4.1 Create Web Service

1. [dashboard.render.com](https://dashboard.render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Settings:

| Setting | Value |
|---------|-------|
| **Name** | `invoiceflow-api` |
| **Region** | Same as Neon (e.g. Ohio) |
| **Branch** | `main` |
| **Root directory** | *(repo root — monorepo)* |
| **Runtime** | Node |
| **Build command** | `npm install && npm run db:generate --workspace=api && npm run build --workspace=api && cd apps/api && npx prisma migrate deploy` |
| **Start command** | `npm run start:prod --workspace=api` |
| **Plan** | **Starter ($7/mo)** |

### 4.2 Environment variables

Set in Render dashboard → **Environment**:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=<neon-connection-string>
JWT_SECRET=<64-char-random-hex>
PORTAL_URL=https://invoiceflow.app/portal
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...                    # optional at launch
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_...
SMTP_FROM=billing@invoiceflow.app
```

Generate JWT secret:

```bash
openssl rand -hex 32
```

### 4.3 Custom domain

1. Render → Settings → **Custom Domains** → `api.invoiceflow.app`
2. Add CNAME at your DNS provider per Render instructions
3. Wait for TLS certificate (automatic)

### 4.4 Health check

Render → Settings → **Health Check Path**: `/`  
(API should respond on root or add a `/health` endpoint if needed.)

### 4.5 Stripe webhook

In Stripe Dashboard → Developers → Webhooks:

- **URL:** `https://api.invoiceflow.app/payments/webhook/stripe`
- **Events:** `checkout.session.completed`, `payment_intent.succeeded`, etc. (match your controller)
- Copy signing secret → `STRIPE_WEBHOOK_SECRET`

### 4.6 Cron jobs note

InvoiceFlow uses in-process `@nestjs/schedule`. On Render Starter you have **one instance** — crons run fine. If you scale to multiple instances later, move crons to Render Cron Jobs or an external scheduler.

### 4.7 `render.yaml` (optional — infra as code)

Create at repo root:

```yaml
services:
  - type: web
    name: invoiceflow-api
    runtime: node
    plan: starter
    region: ohio
    buildCommand: >-
      npm install &&
      npm run db:generate --workspace=api &&
      npm run build --workspace=api &&
      cd apps/api && npx prisma migrate deploy
    startCommand: npm run start:prod --workspace=api
    healthCheckPath: /
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: PORTAL_URL
        value: https://invoiceflow.app/portal
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false
      - key: SMTP_HOST
        value: smtp.resend.com
      - key: SMTP_PORT
        value: "587"
      - key: SMTP_USER
        value: resend
      - key: SMTP_PASS
        sync: false
      - key: SMTP_FROM
        value: billing@invoiceflow.app
```

---

## 5. Admin & Portal — Vercel

### 5.1 Import project

1. [vercel.com/new](https://vercel.com/new) → Import Git repo
2. **Framework:** Next.js
3. **Root directory:** `apps/admin`

### 5.2 Build settings

| Setting | Value |
|---------|-------|
| Build command | `cd ../.. && npm install && npm run build --workspace=admin` |
| Output directory | `.next` (default) |
| Install command | `npm install` (from monorepo root if needed) |

*Alternatively set root to repo root and override build to `npm run build --workspace=admin`.*

### 5.3 Environment variables

```env
NEXT_PUBLIC_API_URL=https://api.invoiceflow.app
```

### 5.4 Domains

| Domain | Purpose |
|--------|---------|
| `invoiceflow.app` | Admin dashboard |
| `www.invoiceflow.app` | Redirect to apex (optional) |

Portal routes live at `https://invoiceflow.app/portal/[id]` — same Next.js app.

### 5.5 Verify

```bash
curl -I https://invoiceflow.app
# Login as admin, open a test portal link
```

---

## 6. Email — Resend

1. Sign up at [resend.com](https://resend.com)
2. Add domain `invoiceflow.app` → configure DNS (SPF, DKIM)
3. Create API key → use as `SMTP_PASS` with user `resend`
4. Free tier: **3,000 emails/month** — enough for early invoice sends + reminders

---

## 7. DNS & Domains

Example DNS records:

| Type | Name | Value |
|------|------|-------|
| CNAME | `api` | Render hostname (`invoiceflow-api.onrender.com`) |
| A / CNAME | `@` | Vercel |
| CNAME | `www` | Vercel |
| TXT | `@` | Resend SPF/DKIM (per Resend dashboard) |

---

## 8. Manual Expo Production Builds

InvoiceFlow uses **managed Expo** (no `android/` / `ios/` in git). Production store builds are done locally — **no EAS Production subscription required**.

### 8.1 Prerequisites

| Platform | Requirements |
|----------|--------------|
| **Both** | Node 20+, repo dependencies installed (`npm install` from root) |
| **Android** | Android Studio, JDK 17, `ANDROID_HOME` set |
| **iOS** | macOS, Xcode 16+, Apple Developer account |
| **Both** | Production API live at `https://api.invoiceflow.app` |

### 8.2 Production environment variables

Set before every production prebuild/build:

```bash
export APP_VARIANT=production
export EXPO_PUBLIC_API_URL=https://api.invoiceflow.app
export EXPO_PUBLIC_PORTAL_URL=https://invoiceflow.app/portal
```

Production bundle IDs (from `app.config.ts`):

- **iOS:** `com.kh.everything.qr`
- **Android:** `com.kh.everything.qr`

### 8.3 Generate native projects

From repo root:

```bash
cd apps/mobile

APP_VARIANT=production \
EXPO_PUBLIC_API_URL=https://api.invoiceflow.app \
EXPO_PUBLIC_PORTAL_URL=https://invoiceflow.app/portal \
npx expo prebuild --clean
```

This creates `android/` and `ios/` locally. **Do not commit** these unless you intentionally switch to a bare workflow — regenerate after plugin or native config changes.

> **Monorepo note:** Run prebuild from `apps/mobile`. Metro is configured for the workspace root (Expo SDK 56).

### 8.4 Android — release signing (one-time setup)

#### Create upload keystore

```bash
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore invoiceflow-upload.keystore \
  -alias invoiceflow \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Back up the keystore and passwords securely.** Losing it blocks Play Store updates.

#### Configure Gradle signing

Create `apps/mobile/android/keystore.properties` (add to `.gitignore`):

```properties
storeFile=../../invoiceflow-upload.keystore
storePassword=YOUR_STORE_PASSWORD
keyAlias=invoiceflow
keyPassword=YOUR_KEY_PASSWORD
```

Edit `android/app/build.gradle` to load signing config for `release` (standard React Native / Expo pattern).

#### Build release AAB

```bash
cd apps/mobile/android

APP_VARIANT=production ./gradlew bundleRelease
```

Output:

```
android/app/build/outputs/bundle/release/app-release.aab
```

Upload this file to **Google Play Console** → Production or internal testing.

#### APK for local testing (optional)

```bash
./gradlew assembleRelease
# android/app/build/outputs/apk/release/app-release.apk
```

### 8.5 iOS — archive & export (Mac)

#### Open workspace

```bash
cd apps/mobile/ios
open InvoiceFlow.xcworkspace
```

*(Project name may match `name` in app.config — check `ios/` folder after prebuild.)*

#### Xcode setup

1. Select target → **Signing & Capabilities**
2. Team: your Apple Developer team
3. Bundle ID: `com.kh.everything.qr`
4. Provisioning: **Automatic** (Distribution for archive)

#### Archive

1. Scheme: **Release**
2. Destination: **Any iOS Device**
3. **Product → Archive**
4. **Distribute App → App Store Connect → Upload**

Or use **Transporter** app with exported `.ipa`.

#### CLI alternative

```bash
cd apps/mobile

APP_VARIANT=production \
EXPO_PUBLIC_API_URL=https://api.invoiceflow.app \
EXPO_PUBLIC_PORTAL_URL=https://invoiceflow.app/portal \
npx expo run:ios --configuration Release --device
```

Still requires signing configured in Xcode first.

### 8.6 Push notifications (required for either path)

`expo-notifications` needs credentials regardless of EAS vs manual:

| Platform | Setup |
|----------|-------|
| **iOS** | APNs key in Apple Developer → upload to Expo project (for push token) or configure in native project |
| **Android** | FCM project in Firebase → `google-services.json` via prebuild / Expo config |

Expo account + project ID (`5be40599-752d-4be8-8f57-1895687a4ad1`) remain useful for push even without paid EAS.

### 8.7 Versioning

Manual builds: bump in `apps/mobile/app.config.ts`:

```ts
version: '1.0.1',
```

- **iOS:** also update **Build** number in Xcode (or `ios/.../Info.plist`)
- **Android:** `versionCode` in `android/app/build.gradle`

EAS `autoIncrement` in `eas.json` is **not** used on manual path — you manage versions yourself.

### 8.8 When to regenerate native code

Run `expo prebuild --clean` again when you:

- Add/remove Expo config plugins
- Change `bundleIdentifier` / `package`
- Upgrade Expo SDK
- Change native permissions (camera, contacts, etc.)

### 8.9 EAS vs manual — quick comparison

| | Manual (this guide) | EAS Production |
|--|---------------------|----------------|
| Build cost | **$0** | Free tier limited; $29/mo optional |
| iOS without Mac | No | Yes (cloud) |
| Signing | You manage | EAS can manage |
| Store upload | Play Console / Xcode | `eas submit` |
| OTA updates | Store releases only* | EAS Update channels |

*EAS Update can be used separately without EAS Build if desired.*

---

## 9. Store Submission (Without EAS Submit)

### 9.1 Google Play

1. Play Console → Create app
2. **Internal testing** track first
3. Upload `app-release.aab`
4. Complete: Data safety, content rating, store listing, privacy policy URL
5. Promote to production (staged rollout recommended: 10% → 100%)

### 9.2 Apple App Store

1. App Store Connect → New app
2. Bundle ID: `com.kh.everything.qr`
3. Upload build via Xcode Organizer or Transporter
4. App Privacy questionnaire, screenshots, review notes
5. **Demo account for reviewers:** `demo@invoiceflow.app` / `demo1234` (if still valid in prod DB)
6. Privacy policy: `https://invoiceflow.app/privacy`
7. Submit for review

### 9.3 Required URLs (host on Vercel or static pages)

- `https://invoiceflow.app/privacy`
- `https://invoiceflow.app/terms`
- `mailto:support@invoiceflow.app` or support page

---

## 10. Alternative Stack — Railway

If you prefer **one dashboard** for API + database:

| Component | Railway |
|-----------|---------|
| Postgres | ~$5–15/mo usage-based |
| NestJS API | ~$5–10/mo usage-based |
| **Typical total** | **$10–25/mo** |

**Setup:**

1. New project → Add **PostgreSQL**
2. Add service from repo → start command: `npm run start:prod --workspace=api`
3. Set same env vars as Render section
4. Custom domain: `api.invoiceflow.app`

**Trade-off:** Bill varies with usage; Render + Neon is more predictable at small scale.

---

## 11. Cost Scaling Scenarios

### Scenario A — Solo founder, manual builds, organic launch

| Period | Services | Monthly |
|--------|----------|---------|
| Month 1–2 | Neon free + Render $7 + Vercel $0 | **$7** |
| Month 3–12 | Neon $19 + Render $7 + Vercel $0 | **$26** |
| **Year 1 infra** | | **~$290** + $136 one-time |

### Scenario B — Same + Resend Pro + Sentry Team at month 6

| Period | Monthly |
|--------|---------|
| Months 1–5 | $26 |
| Months 6–12 | $72 |
| **Year 1 infra** | **~$542** + one-time |

### Scenario C — EAS cloud builds added (no Mac for CI)

| Add-on | Monthly |
|--------|---------|
| EAS Production (optional) | $29 |
| **Total at launch** | **$55/mo** (with Scenario A month 3+) |

### Scenario D — All-in Railway + Vercel

| Monthly | **$10–25** (variable) |

---

## 12. Checklist

### Infrastructure

- [ ] Neon project created; `DATABASE_URL` in Render
- [ ] Prisma `migrate deploy` runs on API deploy
- [ ] Render API live at `https://api.invoiceflow.app`
- [ ] Vercel admin live at `https://invoiceflow.app`
- [ ] Resend domain verified; SMTP env vars set
- [ ] Stripe live keys + webhook configured
- [ ] `JWT_SECRET` is strong and unique (not dev placeholder)

### Mobile (manual)

- [ ] `APP_VARIANT=production` prebuild succeeds
- [ ] Android keystore created and backed up
- [ ] `bundleRelease` produces `.aab`
- [ ] iOS archive uploads to App Store Connect
- [ ] Push notification credentials configured
- [ ] Production API URL verified on device

### Stores

- [ ] Privacy policy + terms published
- [ ] Screenshots + descriptions ready
- [ ] Internal / TestFlight beta completed
- [ ] Production release submitted

### Cost tracking

- [ ] Neon spend alerts enabled
- [ ] Render billing notifications on
- [ ] Break-even target: **3 Pro subs** covers ~$26/mo infra

---

## Quick Reference Commands

```bash
# --- Infra verify ---
curl https://api.invoiceflow.app/
open https://api.invoiceflow.app/api/docs

# --- DB migration (local against Neon) ---
cd apps/api && npx prisma migrate deploy

# --- Manual Android production build ---
cd apps/mobile
APP_VARIANT=production \
EXPO_PUBLIC_API_URL=https://api.invoiceflow.app \
EXPO_PUBLIC_PORTAL_URL=https://invoiceflow.app/portal \
npx expo prebuild --clean
cd android && ./gradlew bundleRelease

# --- Manual iOS ---
cd apps/mobile/ios && open *.xcworkspace
# Then Archive in Xcode
```

---

## Summary

| Question | Answer |
|----------|--------|
| Best cost-effective DB? | **Neon** (free → $19/mo) |
| Best cost-effective API host? | **Render Starter** ($7/mo) |
| Best admin host? | **Vercel Hobby** ($0) |
| Can you skip EAS Production? | **Yes** — local prebuild + Gradle/Xcode |
| Minimum monthly infra at launch? | **~$7/mo** (beta) → **~$26/mo** (launch) |
| Minimum one-time to ship? | **~$136** (stores + domain) |

This stack keeps year-one infrastructure under **~$300–550** while you validate product-market fit, scaling spend only when users and revenue grow.

---

*Review this guide when changing Expo SDK, adding native modules, or moving off bootstrap hosting.*
