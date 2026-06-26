# App Store & Google Play submission

## Prerequisites

| Item | Status |
|------|--------|
| Apple Developer ($99/yr) | Required for iOS |
| Google Play Console ($25 one-time) | Required for Android |
| EAS account | Configured (`projectId` in `app.config.ts`) |
| Privacy policy URL | https://invoiceflow-admin.onrender.com/privacy |
| Demo account for reviewers | `demo@invoiceflow.app` / `demo1234` (seed or register) |

## Environment secrets (EAS)

Set in Expo dashboard or `eas secret`:

```bash
EXPO_PUBLIC_API_URL=https://invoiceflow-api-v1td.onrender.com
EXPO_PUBLIC_PORTAL_URL=https://invoiceflow-admin.onrender.com/portal
EXPO_PUBLIC_MOBILE_APP_KEY=<same as MOBILE_APP_KEY on API>
```

API Render env must include matching `MOBILE_APP_KEY` so mobile auth works with Turnstile enabled.

## Build & submit

```bash
cd apps/mobile
npm run build:prod:ios
npm run build:prod:android
npm run submit:prod:ios
npm run submit:prod:android
```

## App Store listing (copy-paste)

- **Name:** InvoiceFlow: Invoice & Estimate
- **Subtitle:** Free invoice maker for freelancers
- **Keywords:** invoice,estimate,freelance,billing,receipt,small business,free
- **Description:** Create and send professional invoices in under 60 seconds. Free plan with 25 invoices/month. Client portal payments via Stripe & PayPal. Receipt OCR, mileage, time tracking, recurring invoices.
- **Review notes:** Sign in with demo@invoiceflow.app / demo1234. Create a client, tap + Invoice, add a line item, save and send.

## Google Play listing

- **Short description:** Free invoice maker — send & get paid in 60 seconds.
- **Category:** Business
- **Content rating:** Everyone
- **Track:** production (configured in `eas.json`)

## ASO checklist

- [ ] Screenshots: dashboard, invoice create, client portal, pay flow
- [ ] Localized screenshots for ES/FR (optional round 2)
- [ ] Respond to reviews within 24h
- [ ] Ask for review after first **paid** invoice (not signup)
