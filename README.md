# InvoiceFlow

A next-generation mobile invoicing platform built to outperform Invoice Fly and the top 10 App Store invoice apps.

## Stack

| Layer | Technology |
|-------|-----------|
| Mobile (iOS + Android) | Expo / React Native |
| Backend API | NestJS + Prisma + PostgreSQL |
| Admin Panel | Next.js 15 + Tailwind |
| Payments | Stripe (with mock fallback) |

## Quick Start

```bash
# Start database
docker compose up -d

# Setup API
cd apps/api
npm install
npx prisma db push
npx ts-node prisma/seed.ts
npm run start:dev

# Mobile app (new terminal)
cd apps/mobile
npm install
npx expo start

# Admin panel (new terminal)
cd apps/admin
npm install
npm run dev
```

## Demo Credentials

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
- 🌙 Dark mode + **offline cache** with sync queue
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

### Client Portal (Web)
- Public invoice view at `/portal/[id]`
- Pay now button, estimate e-signature canvas
- Open tracking on view

### Admin Panel
- User management
- Platform analytics (signups, revenue, plans)
- Plan management

## Competitive Position

See [COMPETITIVE_ANALYSIS.md](./COMPETITIVE_ANALYSIS.md) for full feature comparison against Invoice Fly, Zoho Invoice, FreshBooks, Invoice Simple, Wave, Square, QuickBooks, Invoice Ninja, HubSpark, and Invoice2go.

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
