# InvoiceFlow

A next-generation mobile invoicing platform built to outperform Invoice Fly and the top 10 App Store invoice apps.

## Stack

| Layer | Technology |
|-------|-----------|
| Mobile (iOS + Android) | Expo SDK 56 / React Native 0.85 |
| Backend API | NestJS 11 + Prisma 7 + PostgreSQL |
| Admin Panel | Next.js 16 + Tailwind 4 |
| Payments | Stripe (with mock fallback) |

## Quick Start

See **[DEV_SETUP.md](./DEV_SETUP.md)** for the full local dev, testing, and debugging guide.

```bash
# One-time setup (from repo root)
npm install
cp apps/api/.env.example apps/api/.env
npm run setup

# Daily dev — use 3 terminals:
npm run api                  # Terminal 1 — API on :3001
npm run dev:mobile:ios       # Terminal 2 — iOS (or dev:mobile:android)
npm run dev:admin            # Terminal 3 — Admin on :3000
```

## Production (Render)

All web hosting runs on **Render** (Postgres + API + admin/landing/portal). See **[RENDER_DEPLOY.md](./RENDER_DEPLOY.md)** for the blueprint deploy steps.

```bash
# After pushing to GitHub: Render Dashboard → New → Blueprint → khdev808/invoiceflow
```


| Role | Email | Password |
|------|-------|----------|
| Demo User | demo@invoiceflow.app | demo1234 |
| Admin | admin@invoiceflow.app | Admin123! |

## API Docs

Swagger UI: http://localhost:3001/api/docs

## Features

### Mobile App
- ⚡ **30-second invoice creation** — fewer taps than InvoiceZap benchmark
- 📄 Invoices, estimates, **credit notes**, recurring billing
- 💰 **Deposit requests** (% or flat), automated **late fees**
- ✍️ **Signature capture** + client e-signatures via portal
- 👥 Client management with contact import
- 📦 **Product/service catalog** for quick line items
- 🚗 **Mileage tracking** with IRS deduction rate
- 💰 Per-item and total taxes + discounts
- 📊 Income reports, P&L, expense tracking
- ⏱️ Time tracking → invoice line items (FreshBooks-style)
- 📸 Receipt scanner with **OCR auto-fill**
- 🔔 Real-time open tracking + **automated payment reminders**
- 💳 Stripe payment links + Apple Pay / PayPal
- 🎨 6 professional templates with branding
- 🌍 Multi-currency + **5 languages** (EN, ES, FR, DE, PT)
- 📤 PDF export + **WhatsApp** + client portal sharing
- 🔔 Push notifications (Expo) + in-app alerts
- 📱 QR payment codes + deposit-aware Stripe/PayPal
- ✏️ Invoice editing, recurring schedule manager
- 📊 Plan usage screen (free tier limits)
- 🔗 Webhook integrations settings
- 🌙 Dark mode (system) + **offline create queue** with sync
- ☁️ Cross-device cloud sync

### Backend API
- JWT authentication
- Full CRUD for clients, invoices, expenses, time entries, **products, mileage**
- Estimate → invoice conversion, **credit notes**, **deposit tracking**
- **Cron jobs**: overdue marking, late fees, payment reminders, recurring billing
- Payment recording + Stripe checkout
- **OCR receipt parsing** endpoint
- **Client portal** public API with e-signatures
- Open tracking webhooks
- Admin analytics dashboard
- Swagger documentation

- 🎯 First-run onboarding carousel
- 💱 User currency on dashboard and reports

### Client Portal (Web)
- Public invoice view at `/portal/[id]`
- Deposit-aware **Stripe + PayPal** pay buttons (no auth)
- Template-colored header, estimate e-signature canvas
- Open tracking on view

### Admin Panel
- User management
- Platform analytics (signups, revenue, plans)
- Plan management

## Competitive Position

See [COMPETITIVE_ANALYSIS.md](./COMPETITIVE_ANALYSIS.md) and [PRODUCT_LAUNCH_REPORT.md](./PRODUCT_LAUNCH_REPORT.md) for competitive comparison, win probability, and App Store publishing guide.

## Project Structure

```
invoiceflow/
├── apps/
│   ├── mobile/     # Expo React Native app
│   ├── api/        # NestJS backend
│   └── admin/      # Next.js admin panel
├── docker-compose.yml
└── COMPETITIVE_ANALYSIS.md
```
