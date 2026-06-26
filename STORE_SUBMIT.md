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
pnpm run build:prod:ios
pnpm run build:prod:android
pnpm run submit:prod:ios
pnpm run submit:prod:android
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

## Localized ASO (round 2)

Copy-paste into App Store Connect / Google Play Console per locale.

### Español (ES)

| Field | Copy |
|-------|------|
| **Name** | InvoiceFlow: Facturas y Presupuestos |
| **Subtitle** | Factura gratis para autónomos |
| **Keywords** | factura,presupuesto,freelance,cobros,recibo,negocio,gratis |
| **Short description (Play)** | Crea y envía facturas profesionales en 60 segundos. Plan gratis. |

### Français (FR)

| Field | Copy |
|-------|------|
| **Name** | InvoiceFlow: Factures & Devis |
| **Subtitle** | Facturation gratuite pour indépendants |
| **Keywords** | facture,devis,freelance,paiement,reçu,entreprise,gratuit |
| **Short description (Play)** | Créez et envoyez des factures en 60 secondes. Gratuit pour commencer. |

### Deutsch (DE)

| Field | Copy |
|-------|------|
| **Name** | InvoiceFlow: Rechnungen & Angebote |
| **Subtitle** | Kostenlose Rechnungs-App |
| **Keywords** | rechnung,angebot,freelancer,abrechnung,beleg,kleinunternehmen |
| **Short description (Play)** | Professionelle Rechnungen in 60 Sekunden. Kostenloser Einstieg. |

### Português (PT)

| Field | Copy |
|-------|------|
| **Name** | InvoiceFlow: Faturas e Orçamentos |
| **Subtitle** | Faturação grátis para freelancers |
| **Keywords** | fatura,orçamento,freelance,cobrança,recibo,negócio,grátis |
| **Short description (Play)** | Envie faturas profissionais em 60 segundos. Plano gratuito. |

### हिन्दी (HI)

| Field | Copy |
|-------|------|
| **Name** | InvoiceFlow: इनवॉइस और अनुमान |
| **Subtitle** | फ्रीलांसर्स के लिए मुफ्त बिलिंग |
| **Keywords** | invoice,bill,estimate,freelance,भुगतान,रसीद,व्यापार |
| **Short description (Play)** | 60 सेकंड में प्रोफेशनल इनवॉइस बनाएं। मुफ्त शुरुआत। |

## In-app localization (web)

Web app supports **English, Español, Français** in Settings → language picker (AppShell) and on login/register.
