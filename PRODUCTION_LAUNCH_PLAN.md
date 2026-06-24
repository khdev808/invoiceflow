# InvoiceFlow — Production Launch Plan

**Date:** June 2026  
**Status:** Pre-production (feature-complete beta)  
**Goal:** Ship InvoiceFlow to App Store + Google Play with live payments, hosted API, and a path to sustainable MRR.

**Related docs:** [PRODUCT_LAUNCH_REPORT.md](./PRODUCT_LAUNCH_REPORT.md) · [PRODUCT_MARKET_ANALYSIS.md](./PRODUCT_MARKET_ANALYSIS.md) · [COMPETITIVE_ANALYSIS.md](./COMPETITIVE_ANALYSIS.md) · [DEV_SETUP.md](./DEV_SETUP.md)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [What’s Left Before Production](#2-whats-left-before-production)
3. [Production Launch Checklist (Full Steps)](#3-production-launch-checklist-full-steps)
4. [Infrastructure & Deployment](#4-infrastructure--deployment)
5. [Estimated Running Costs](#5-estimated-running-costs)
6. [Year 1 MRR Forecast](#6-year-1-mrr-forecast)
7. [Marketing Strategy](#7-marketing-strategy)
8. [Growth Strategy](#8-growth-strategy)
9. [Future Implementation Roadmap](#9-future-implementation-roadmap)
10. [Legal, Compliance & Trust](#10-legal-compliance--trust)
11. [Operations & Monitoring](#11-operations--monitoring)
12. [Timeline (Recommended)](#12-timeline-recommended)
13. [Success Metrics](#13-success-metrics)

---

## 1. Executive Summary

InvoiceFlow is **~90% product-ready** for a US-focused freelance/SMB launch. Core invoicing, portal payments, automation crons, and mobile UX are built. **Production blockers are mostly operational**, not feature gaps:

| Blocker category | Examples |
|------------------|----------|
| **Monetization UX** | No in-app Pro checkout (Stripe Billing / RevenueCat) |
| **Production services** | Live Stripe, SMTP, push credentials, hosted DB/API |
| **Store & legal** | App Store assets, privacy policy, terms, support channel |
| **Ops hardening** | Prisma migrations (not just `db push`), Sentry, backups, rate limits |

**Recommended path:** Closed beta (4 weeks) → production infra + subscriptions (2 weeks) → store submission (2 weeks) → public launch with ASO + community marketing.

**Year 1 realistic target:** **$3K–8K MRR** by month 12 with disciplined execution; **$15K+ MRR** requires paid acquisition or viral breakout.

---

## 2. What’s Left Before Production

### 2.1 Critical (must ship before public launch)

| # | Item | Current state | Action |
|---|------|---------------|--------|
| 1 | **Self-serve Pro subscription** | Plan limits enforced; no paywall | Integrate **RevenueCat** (iOS/Android IAP) or **Stripe Billing** + web checkout; upgrade screen on limit hit |
| 2 | **Production Stripe** | Mock/test fallback in code | Live `STRIPE_SECRET_KEY`, webhook endpoint, test live checkout end-to-end |
| 3 | **Production database** | Local Docker dev | Managed Postgres (Neon, Render, Supabase) + backups |
| 4 | **API hosting** | Local `:3001` | Deploy NestJS to Render/Railway/Fly; bind `0.0.0.0:$PORT` |
| 5 | **Admin + portal hosting** | Local `:3000` | Deploy Next.js to Vercel/Netlify; set `NEXT_PUBLIC_API_URL` |
| 6 | **Mobile production builds** | EAS configured; dev bundle IDs exist | `eas build --profile production`; submit iOS + Android |
| 7 | **Production env in mobile** | `api.invoiceflow.app` defaults in config | Set `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_PORTAL_URL` in EAS production profile |
| 8 | **SMTP / email** | Empty in `.env.example` | Resend, SendGrid, or AWS SES for invoice send + reminders |
| 9 | **Push notifications (devices)** | Expo push wired; needs EAS credentials | Configure FCM (Android) + APNs (iOS) in EAS |
| 10 | **Privacy Policy + Terms** | Not in repo | Host at `invoiceflow.app/privacy` and `/terms`; link in stores |
| 11 | **Support channel** | None | `support@invoiceflow.app` + in-app link |
| 12 | **Prisma migrations** | Uses `db push` only | Create initial migration; use `prisma migrate deploy` in CI/CD |
| 13 | **JWT secret** | Placeholder in example | Strong random `JWT_SECRET` in production secrets |

### 2.2 Important (ship within 30 days of launch)

| # | Item | Current state | Action |
|---|------|---------------|--------|
| 14 | **PayPal live** | Mock PayPal.me fallback | Live PayPal REST app or defer and hide PayPal CTA until ready |
| 15 | **OCR** | Mock service (`ocr.service.ts`) | Integrate Google Vision, AWS Textract, or Veryfi; or label “beta” and keep manual entry |
| 16 | **Sentry / error tracking** | Not configured | API + mobile crash reporting |
| 17 | **Rate limiting** | Not visible | Add `@nestjs/throttler` on auth + public endpoints |
| 18 | **Admin plan editor UI** | API exists; UI read-only | Allow plan upgrades from admin or automate via webhooks |
| 19 | **Store screenshots & video** | Not prepared | 6.7", 6.5", 5.5" iPhone + Android phone/tablet |
| 20 | **App Store review notes** | N/A | Demo account `demo@invoiceflow.app` / `demo1234` for reviewers |
| 21 | **Database seed** | Dev demo data | **Do not** run seed in production; separate admin bootstrap script |
| 22 | **HTTPS everywhere** | Dev uses HTTP | API, portal, webhooks all TLS |
| 23 | **Cron reliability** | In-process `@nestjs/schedule` | Verify single instance or use external cron (Render cron, GitHub Actions) |

### 2.3 Nice-to-have (post-launch)

| Item | Notes |
|------|-------|
| Custom domain email (Google Workspace) | `hello@`, `support@` |
| Stripe Terminal / Tap to Pay | Hardware in-person payments |
| More invoice templates (20+) | Competitive vs Invoice Simple |
| Team / multi-user roles | Schema has `UserRole`; no UI |
| Accountant export (CSV, QBO) | Retention for growing SMBs |
| Apple Sign In / Google Sign In | Faster onboarding |
| Referral program | Growth loop |

---

## 3. Production Launch Checklist (Full Steps)

### Phase A — Accounts & domains (Week 1)

- [ ] Register domain: `invoiceflow.app` (or chosen name)
- [ ] Apple Developer Program — **$99/year**
- [ ] Google Play Console — **$25 one-time**
- [ ] Expo account + EAS project (already: `@khdev4678/invoiceflow`)
- [ ] Stripe account (live mode activated, business verified)
- [ ] PayPal Business (optional at launch)
- [ ] Resend or SendGrid for transactional email
- [ ] Sentry account (free tier)
- [ ] DNS: `api.invoiceflow.app`, `invoiceflow.app`, `www`

### Phase B — Backend production (Week 1–2)

```bash
# 1. Provision Postgres (example: Neon)
# Create database, copy connection string

# 2. Set production secrets (Render/Railway dashboard or CLI)
DATABASE_URL=postgresql://...
JWT_SECRET=<64-char-random>
PORT=3001
PORTAL_URL=https://invoiceflow.app/portal
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SMTP_HOST=smtp.resend.com
SMTP_USER=resend
SMTP_PASS=re_...
SMTP_FROM=billing@invoiceflow.app
PAYPAL_CLIENT_ID=...  # optional

# 3. Run migrations (after creating initial migration)
cd apps/api
npx prisma migrate deploy

# 4. Create production admin (manual SQL or script — NOT full seed)
# 5. Deploy API
# 6. Register Stripe webhook: POST https://api.invoiceflow.app/payments/webhook/stripe
# 7. Smoke test: /api/docs, login, create invoice, payment link
```

**Render `render.yaml` sketch:**

```yaml
services:
  - type: web
    name: invoiceflow-api
    runtime: node
    plan: starter
    buildCommand: npm install && npm run db:generate --workspace=api && npm run build --workspace=api
    startCommand: npm run start:prod --workspace=api
    healthCheckPath: /
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: NODE_ENV
        value: production
```

### Phase C — Admin & portal (Week 2)

```bash
# Vercel/Netlify
# Root: apps/admin
# Build: npm run build --workspace=admin
# Env: NEXT_PUBLIC_API_URL=https://api.invoiceflow.app

# Verify:
# - https://invoiceflow.app (admin login)
# - https://invoiceflow.app/portal/<invoice-id> (public pay + sign)
```

### Phase D — Subscriptions & monetization (Week 2–3)

**Option A — RevenueCat (recommended for mobile-first)**

1. Create RevenueCat project; link App Store Connect + Play Console
2. Products: `pro_monthly` ($9.99), `pro_yearly` ($79)
3. Mobile: `@revenuecat/purchases-expo` + paywall screen on limit hit
4. Webhook: RevenueCat → API to set `user.plan = 'pro'`

**Option B — Stripe Billing (web-first upgrade)**

1. Stripe Products + Prices for Pro/Business
2. Hosted Checkout or Customer Portal link from Plan screen
3. Webhook: `customer.subscription.updated` → update user plan in DB

**Minimum paywall UX:**

- Plan screen: pricing cards + “Upgrade” CTA
- On 25th invoice: modal blocking create with upgrade path
- Pro: remove “InvoiceFlow” footer on PDFs (if branded on free)

### Phase E — Mobile production build (Week 3)

```bash
cd apps/mobile

# EAS secrets (production)
eas secret:create --name EXPO_PUBLIC_API_URL --value https://api.invoiceflow.app
eas secret:create --name EXPO_PUBLIC_PORTAL_URL --value https://invoiceflow.app/portal

# Production builds (bundle: com.kh.everything.qr)
eas build --platform all --profile production

# Push credentials (first time)
eas credentials

# Submit
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

**Store assets checklist:**

| Asset | iOS | Android |
|-------|-----|---------|
| App icon 1024×1024 | ✅ in repo | ✅ adaptive icons in repo |
| Screenshots (5–8) | 6.7", 6.5", 5.5" | Phone + 7" tablet |
| Short video (optional) | 15–30s preview | Feature graphic 1024×500 |
| Privacy policy URL | Required | Required |
| Data safety form | App Privacy labels | Play Data safety |
| Age rating | 4+ | Everyone |
| Category | Finance / Business | Business |

### Phase F — Closed beta (Week 3–4)

- [ ] TestFlight (iOS) + Play internal track (Android)
- [ ] Recruit **50–100** freelancers (Reddit, personal network, indie hackers)
- [ ] Track: signup → first invoice sent → first payment received
- [ ] Fix P0 bugs (payments, sync, crashes)
- [ ] Collect 10+ written testimonials for store listing

### Phase G — Public launch (Week 5–6)

- [ ] Move Android to **production** track (staged rollout 10% → 100%)
- [ ] Release iOS v1.0.0
- [ ] Product Hunt launch (Tuesday)
- [ ] Press kit + landing page at `invoiceflow.app`
- [ ] Monitor Stripe success rate, API errors, store reviews daily

---

## 4. Infrastructure & Deployment

### Architecture (production)

```
                    ┌─────────────────┐
                    │  App Store /    │
                    │  Google Play    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Expo mobile    │
                    │  (EAS builds)   │
                    └────────┬────────┘
                             │ HTTPS
         ┌───────────────────┼───────────────────┐
         │                   │                   │
┌────────▼────────┐ ┌────────▼────────┐ ┌───────▼────────┐
│ api.invoiceflow │ │ invoiceflow.app │ │ Stripe / PayPal │
│ .app (NestJS)   │ │ (Next.js admin  │ │ (webhooks)      │
│                 │ │  + portal)      │ │                 │
└────────┬────────┘ └─────────────────┘ └─────────────────┘
         │
┌────────▼────────┐
│ Managed Postgres│
│ (Neon/Render)   │
└─────────────────┘
```

### Environment matrix

| Service | Dev | Production |
|---------|-----|------------|
| API URL | `localhost:3001` / `10.0.2.2` | `https://api.invoiceflow.app` |
| Portal | `localhost:3000/portal` | `https://invoiceflow.app/portal` |
| Mobile bundle | `com.kh.everything.qr.dev` | `com.kh.everything.qr` |
| Database | Docker `:5434` | Managed Postgres SSL |
| Stripe | Test keys | Live keys + webhooks |

### CI/CD recommendations

| Step | Tool |
|------|------|
| API deploy on `main` | Render auto-deploy or GitHub Actions |
| Admin deploy on `main` | Vercel Git integration |
| Mobile | EAS Build on git tag `v*` |
| DB migrations | `prisma migrate deploy` in API build step |
| Secrets | Render/Vercel/EAS secret stores — never in git |

---

## 5. Estimated Running Costs

### One-time costs (launch)

| Item | Cost (USD) |
|------|------------|
| Apple Developer Program | $99 / year |
| Google Play Console | $25 one-time |
| Domain (`invoiceflow.app`) | ~$12–40 / year |
| Logo/store asset design (optional Fiverr/Canva) | $0–500 |
| **Total one-time (year 1)** | **~$136–664** |

### Monthly infrastructure (bootstrap → scale)

| Service | Bootstrap (0–2K users) | Growth (2K–20K users) |
|---------|------------------------|------------------------|
| **Postgres** (Neon free → Pro / Render) | $0–19 | $25–69 |
| **API** (Render Starter / Railway) | $7–25 | $25–85 |
| **Admin + portal** (Vercel Hobby → Pro) | $0–20 | $20 |
| **EAS** (free tier → Production) | $0–29 | $29–99 |
| **Email** (Resend 3k/mo free → paid) | $0–20 | $20–80 |
| **Sentry** | $0 | $26+ |
| **Domain email** (optional Google Workspace) | $0–7 | $7 |
| **CDN / misc** | $0 | $10–30 |
| **Subtotal infra** | **$7–120 / mo** | **$150–400 / mo** |

### Payment processing (pass-through — not your revenue)

| Provider | Fee |
|----------|-----|
| Stripe (client invoice payments) | 2.9% + $0.30 per successful charge (US cards) |
| Apple IAP (Pro subscription) | 15% (Small Business Program year 1) or 30% |
| Google Play IAP | 15% first $1M/year, then 30% |

### Marketing budget (optional)

| Tier | Monthly spend | Use |
|------|---------------|-----|
| **Organic only** | $0 | Reddit, PH, TikTok, ASO |
| **Lean paid** | $500–1,500 | Apple Search Ads, Meta lookalike |
| **Growth** | $3,000–10,000 | Influencers, YouTube, podcast sponsors |

### Year 1 total cost estimate (bootstrap scenario)

| Category | Low | High |
|----------|-----|------|
| One-time (stores + domain) | $136 | $664 |
| Infra (12 months avg $50/mo) | $600 | $1,440 |
| Marketing (organic + $500/mo ads × 6 mo) | $0 | $3,000 |
| **Total year 1 cash out** | **~$736** | **~$5,100** |

*Excludes founder time. Stripe/PayPal fees are deducted from client payments, not platform OPEX.*

---

## 6. Year 1 MRR Forecast

**Pricing:** Free ($0, 25 invoices/mo) · Pro ($9.99/mo or $79/yr ≈ $6.58/mo) · Business ($19.99/mo, future)

**Assumptions:**

- US-first launch, finance category ASO
- Free → Pro conversion: **3–6%** of MAU (industry SMB apps: 2–8%)
- Monthly churn on Pro: **5–8%**
- Yearly plan mix: **25%** of paid users (higher retention)
- Blended ARPU (paid users): **~$9.20/mo**

### Month-by-month scenario — **Base case**

| Month | MAU | New signups/mo | Paid subs | MRR |
|-------|-----|----------------|-----------|-----|
| 1 (beta) | 150 | 150 | 5 | $46 |
| 2 (launch) | 400 | 300 | 18 | $166 |
| 3 | 800 | 450 | 38 | $350 |
| 4 | 1,200 | 500 | 58 | $534 |
| 5 | 1,800 | 650 | 85 | $782 |
| 6 | 2,500 | 800 | 115 | $1,058 |
| 7 | 3,200 | 850 | 145 | $1,334 |
| 8 | 4,000 | 900 | 175 | $1,610 |
| 9 | 5,000 | 1,000 | 210 | $1,932 |
| 10 | 6,200 | 1,100 | 250 | $2,300 |
| 11 | 7,500 | 1,200 | 295 | $2,714 |
| 12 | 9,000 | 1,300 | 340 | $3,128 |

**Year 1 exit MRR (base):** ~**$3,100/mo** (~**$37K ARR** run rate)  
**Year 1 cumulative revenue (approx):** ~**$15K–18K** (ramp, not exit × 12)

### Scenario comparison (month 12)

| Scenario | MAU | Paid subs | MRR | ARR run rate |
|----------|-----|-----------|-----|--------------|
| **Conservative** | 3,000 | 90 | $828 | ~$10K |
| **Base** | 9,000 | 340 | $3,128 | ~$37K |
| **Strong** | 25,000 | 1,000 | $9,200 | ~$110K |
| **Breakout** | 80,000 | 3,200 | $29,440 | ~$353K |

### Break-even on infra + lean marketing

| Monthly OPEX | MRR needed (Pro subs @ $9.99) |
|--------------|-------------------------------|
| $50 (bootstrap infra) | ~5 Pro subs |
| $200 (infra + tools) | ~20 Pro subs |
| $1,500 (infra + lean ads) | ~150 Pro subs |

**Profitable on cash basis (bootstrap)** is achievable around **month 4–6** if conversion holds and infra stays lean.

### Revenue beyond subscriptions (year 2+)

| Stream | Potential |
|--------|-----------|
| Business tier ($19.99) | +30–50% ARPU on power users |
| Template marketplace | $2–5 per premium pack |
| Payment margin (optional platform fee) | Controversial; usually avoid |
| API / white-label (Business) | $49–199/mo agencies |
| Affiliate (Stripe Atlas, banking) | Low but passive |

---

## 7. Marketing Strategy

### Positioning

> **Invoice Fly speed. FreshBooks features. Wave’s price.**

**Primary audience:** US freelancers and solo trades (plumbers, cleaners, consultants, photographers) who invoice from their phone.

**Secondary:** Invoice Fly refugees (price + sync pain), Wave users wanting faster mobile.

### Pre-launch (4 weeks before)

| Tactic | Detail |
|--------|--------|
| Landing page | `invoiceflow.app` — hero video “invoice in 30 seconds”, email waitlist |
| Beta list | 50–100 testers; Slack or Discord community |
| Content seeding | 5 TikTok/Reels scripts filmed before launch |
| ASO research | Target keywords: *invoice maker, estimate app, freelance invoice, billing app* |
| Competitor review mining | Reply on Invoice Fly 1★ reviews (sync, price) with empathetic “we built X” |

### Launch week

| Day | Action |
|-----|--------|
| **T-7** | TestFlight / Play internal final build |
| **T-3** | Product Hunt “coming soon” + hunter outreach |
| **T-0 (Tuesday)** | Product Hunt launch, Reddit posts (r/freelance, r/smallbusiness) |
| **T+1** | Indie Hackers post, Hacker News Show HN (if technical angle) |
| **T+3** | Email waitlist → download links |
| **T+7** | First TikTok/Reels batch (3 videos) |

### Always-on channels (months 1–12)

| Channel | Cadence | Content |
|---------|---------|---------|
| **ASO** | Monthly keyword refresh | Update screenshots per season |
| **TikTok / Reels / Shorts** | 3×/week | “30-second invoice”, “got paid same day”, before/after |
| **Reddit** | 2×/week (value-first) | Answer “best invoice app” threads |
| **SEO blog** | 2 posts/month | “Invoice template for contractors”, “how to request deposit” |
| **YouTube** | 2 videos/month | Tutorial: estimates, Stripe setup, mileage |
| **Email lifecycle** | Automated | D1 onboarding, D7 unused nudge, limit warning, upgrade |
| **Apple Search Ads** | After month 2 | Bid on “invoice”, “estimate”, competitor names (careful) |

### Paid acquisition (when unit economics work)

**Target CAC:** < **$40** (3-month Pro LTV ≈ $30–28; need yearly plans or retention to justify higher CAC)

| Channel | When to start | Notes |
|---------|---------------|-------|
| Apple Search Ads | Month 2–3 | Highest intent for iOS finance |
| Meta (FB/IG) | Month 4+ | Lookalike from email list |
| Google UAC | Month 6+ | Android scale |
| Influencer micro (10–50K) | Month 3+ | Trades TikTokers |

### Messaging pillars

1. **Speed** — “Professional invoice in under 30 seconds”
2. **Free to start** — “25 invoices/month free, no card required”
3. **Get paid faster** — Stripe, PayPal, reminders, portal
4. **Built for mobile** — “Not a desktop app shrunk down”
5. **No subscription shock** — “$9.99/mo Pro vs $35/week competitors”

---

## 8. Growth Strategy

### Flywheel

```
Free tier → Send invoice → Client pays via portal → User sees value
     → Hits 25/mo limit → Upgrade Pro → More invoices → Reviews + referrals
```

### Growth loops to implement

| Loop | Mechanic | Priority |
|------|----------|----------|
| **Client portal viral** | “Powered by InvoiceFlow” on free tier PDFs/portal | P0 |
| **Referral** | Give 1 month Pro for referrer + referee | P1 |
| **Review prompt** | Ask after 3rd paid invoice (in-app, not annoying) | P0 |
| **WhatsApp share** | Already built — optimize message copy + preview | P0 |
| **SEO portal pages** | Public marketing site indexed | P1 |
| **Template gallery** | Shareable template previews on web | P2 |
| **Integration marketplace** | Zapier featured app listing | P2 |

### Retention drivers

| Feature | Why it retains |
|---------|----------------|
| Recurring invoices | Switching cost |
| Client history | Data lock-in (ethical) |
| Automation (reminders, late fees) | Saves time monthly |
| Time → invoice | Workflow integration |
| Multi-device sync | PostgreSQL cloud truth |

### Geographic expansion order

1. **United States** (launch)
2. **UK, Canada, Australia** (English, currencies ready)
3. **Mexico + Brazil** (ES/PT i18n exists)
4. **EU** (VAT fields, GDPR, local payments)
5. **India** (UPI integration required for scale)

### Partnership targets

| Partner type | Examples |
|--------------|----------|
| Payment | Stripe Atlas alumni newsletter |
| Freelance platforms | Upwork community (unofficial), Fiverr forums |
| Trade associations | Local HVAC/plumber associations |
| Accountants | Referral for clients too small for QBO |
| App aggregators | AlternativeTo, SaaSHub listing |

---

## 9. Future Implementation Roadmap

### Q1 post-launch (months 1–3) — **Revenue & stability**

| Item | Effort | Impact |
|------|--------|--------|
| RevenueCat / Stripe Billing paywall | 1–2 weeks | **Critical for MRR** |
| Sentry + uptime monitoring | 2 days | Trust |
| Prisma migrations + backup policy | 3 days | Data safety |
| Real OCR (Google Vision / Veryfi) | 1–2 weeks | Feature parity |
| Upgrade screen + yearly plan UI | 1 week | Conversion |
| In-app review prompt | 2 days | ASO |
| Rate limiting + security headers | 3 days | Abuse prevention |

### Q2 (months 4–6) — **Conversion & retention**

| Item | Effort | Impact |
|------|--------|--------|
| Referral program | 2 weeks | Growth |
| Email drip campaigns (Resend) | 1 week | Activation |
| 12 more invoice templates | 2–3 weeks | ASO / differentiation |
| Apple Sign In + Google Sign In | 1 week | Onboarding friction |
| Business tier features (webhooks UI polish) | 2 weeks | ARPU |
| Admin: plan editor + user search | 1 week | Ops |

### Q3 (months 7–9) — **Expansion**

| Item | Effort | Impact |
|------|--------|--------|
| Team members (2–5 seats) | 4–6 weeks | Business tier |
| QuickBooks / Xero export | 2 weeks | Retention |
| VAT / tax ID fields (EU) | 2 weeks | EU launch |
| Android Tap to Pay (Stripe Terminal) | 4+ weeks | Trades segment |
| Web app (invoice create on desktop) | 6+ weeks | New channel |

### Q4 (months 10–12) — **Scale**

| Item | Effort | Impact |
|------|--------|--------|
| API rate limits + API keys (Business) | 3 weeks | B2B |
| White-label portal (agency) | 6+ weeks | New segment |
| AI line-item suggestions | 2–4 weeks | Differentiation |
| Multi-business per account | 4 weeks | Power users |
| SOC 2 / security page (light) | Ongoing | Enterprise trust |

### Intentionally out of scope (year 1)

- Full double-entry accounting (QuickBooks territory)
- Payroll
- Inventory / POS
- 40+ payment gateways
- CRM + scheduling suite (HubSpark territory)

---

## 10. Legal, Compliance & Trust

### Required documents

| Document | Purpose |
|----------|---------|
| **Privacy Policy** | GDPR, CCPA, App Store requirement |
| **Terms of Service** | Liability, acceptable use |
| **Cookie policy** | If marketing site uses analytics |
| **EULA** | Optional; often merged into Terms |

### App Store compliance

| Topic | InvoiceFlow data |
|-------|------------------|
| Contacts | Import clients — disclose in privacy label |
| Camera | Receipt scan — disclose |
| Financial data | Invoices, payments — encrypt in transit (TLS) |
| Account deletion | **Implement** account + data delete (GDPR/CCPA) |
| Kids | Not directed at children; 4+ / Everyone rating |

### Payment compliance

- You are **not** storing card numbers (Stripe handles PCI)
- Issue **1099-K** awareness for US users (informational FAQ, not tax advice)
- Stripe Connect **not** required unless you take platform fees on client payments

### Security checklist

- [ ] HTTPS only
- [ ] `JWT_SECRET` rotated; short-lived tokens considered
- [ ] Password bcrypt (already in place)
- [ ] SQL injection protected (Prisma parameterized)
- [ ] CORS restricted to known origins
- [ ] Webhook signature verification (Stripe — already in controller)
- [ ] Dependency audit: `npm audit` in CI
- [ ] Database automated backups (7–30 day retention)

---

## 11. Operations & Monitoring

### Dashboards to watch weekly

| Metric | Source | Target |
|--------|--------|--------|
| API uptime | Render / UptimeRobot | > 99.5% |
| Payment success rate | Stripe Dashboard | > 95% |
| Crash-free sessions | Sentry / Expo | > 99% |
| Free → Pro conversion | DB + RevenueCat | > 3% |
| D7 retention | Analytics | > 25% |
| Invoices sent / user / week | API logs | Increasing |
| App Store rating | App Store Connect | ≥ 4.5★ |
| Support tickets | Email | < 24h response |

### Incident runbook (P0)

1. **API down** — Check Render status, DB connection, rollback deploy
2. **Payments failing** — Verify Stripe status, webhook secret, API keys
3. **Login broken** — JWT secret mismatch after deploy?
4. **Store rejection** — Read resolution center; common: demo account, privacy URL

### Support stack (bootstrap)

| Tool | Cost |
|------|------|
| `support@invoiceflow.app` (forward to Gmail) | Free |
| Crisp or Intercom (later) | Free–$25/mo |
| Notion FAQ / help center | Free |

---

## 12. Timeline (Recommended)

```
Week 1–2   ████░░░░░░  Infra + Stripe live + SMTP + migrations
Week 2–3   ██████░░░░  Subscriptions + paywall + EAS production build
Week 3–4   ████████░░  Closed beta (50–100 users)
Week 4–5   ██████████  Store assets + legal pages + submission
Week 5–6   ██████████  Public launch (PH + Reddit + ASO)
Month 2–3  ░░░░████░░  Paid ads test + content engine
Month 4–6  ░░░░░░████  Retention features + referral
Month 7–12 ░░░░░░░░██  Business tier + EU prep
```

**Total time to public launch:** **5–6 weeks** from today if full-time focus.  
**Part-time (nights/weekends):** **10–12 weeks**.

---

## 13. Success Metrics

### Launch success (30 days)

| KPI | Target |
|-----|--------|
| Downloads | 1,000+ |
| MAU | 400+ |
| Invoices sent | 2,000+ |
| Paid subs | 15+ |
| MRR | $150+ |
| App Store rating | 4.0+ (10+ reviews) |

### Year 1 success

| KPI | Base target | Stretch |
|-----|-------------|---------|
| MAU | 9,000 | 25,000 |
| Paid subs | 340 | 1,000 |
| MRR | $3,100 | $9,200 |
| Churn (monthly) | < 7% | < 5% |
| NPS | > 30 | > 50 |

---

## Appendix A — Quick Command Reference

```bash
# Production API deploy prep
npm run db:generate --workspace=api
npm run build --workspace=api

# EAS production
cd apps/mobile && eas build --platform all --profile production
eas submit --platform all --profile production

# Health checks
curl https://api.invoiceflow.app/
open https://api.invoiceflow.app/api/docs
```

## Appendix B — Production env checklist

| Variable | Where |
|----------|-------|
| `DATABASE_URL` | API (Render) |
| `JWT_SECRET` | API |
| `STRIPE_SECRET_KEY` | API |
| `STRIPE_WEBHOOK_SECRET` | API |
| `SMTP_*` | API |
| `PORTAL_URL` | API |
| `NEXT_PUBLIC_API_URL` | Admin (Vercel) |
| `EXPO_PUBLIC_API_URL` | EAS secrets |
| `EXPO_PUBLIC_PORTAL_URL` | EAS secrets |
| `APPLE_ID`, `ASC_APP_ID`, `APPLE_TEAM_ID` | EAS submit |
| `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` | EAS submit |

---

## Final Verdict

| Question | Answer |
|----------|--------|
| Is the product ready to build for production? | **Yes** |
| Is it ready to ship to stores today? | **No** — ~5–6 weeks of infra, paywall, legal, beta |
| Biggest blocker? | **Self-serve subscriptions + live payments** |
| Biggest risk? | **Distribution**, not technology |
| Bootstrap cost to launch? | **~$150–700 one-time + $7–120/mo** |
| Realistic year 1 MRR? | **$800–3,100/mo** (conservative–base) |

InvoiceFlow has the **product depth to compete**. Production success is an **execution problem**: ship payments, ship paywall, ship to stores, then market relentlessly to solo businesses in the US.

---

*Document owner: Product / Engineering · Review quarterly or after major release*
