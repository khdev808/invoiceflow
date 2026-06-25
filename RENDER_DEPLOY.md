# Deploy InvoiceFlow on Render (all-in-one)

This repo includes a [Render Blueprint](https://render.com/docs/blueprint-spec) at `render.yaml` that provisions:

| Resource | Name | Purpose |
|----------|------|---------|
| PostgreSQL | `invoiceflow-db` | Production database |
| Web Service | `invoiceflow-api` | NestJS API (`apps/api`) |
| Web Service | `invoiceflow-admin` | Next.js landing + admin + client portal (`apps/admin`) |

Estimated cost: **~$14/mo** (free Postgres + 2× Starter web) or **~$21/mo** with paid Postgres.

---

## One-time setup (you do this once)

### 1. Push this repo to GitHub

Render deploys from Git. The repo must exist on GitHub and Render must have access:

1. Create the repo (if needed): [github.com/new](https://github.com/new) → `invoiceflow`
2. Push from your machine (use GitHub CLI, SSH, or HTTPS with a token):

```bash
git push origin main
```

3. In Render: **Account Settings → Connect GitHub** and grant access to `khdev808/invoiceflow`

> If blueprint validation says `branch main could not be found`, GitHub is not connected or the push has not completed.

### 2. Connect Render to GitHub

1. Open [dashboard.render.com](https://dashboard.render.com)
2. **New → Blueprint**
3. Connect GitHub → select **`khdev808/invoiceflow`**
4. Render reads `render.yaml` and shows 3 resources
5. Click **Apply**

> First deploy takes ~10–15 minutes (install + build + migrate).

### 3. Set secret environment variables (Render Dashboard)

After the blueprint is created, open **`invoiceflow-api` → Environment** and add:

| Variable | Required | Notes |
|----------|----------|-------|
| `STRIPE_SECRET_KEY` | Optional at beta | Live key when ready |
| `STRIPE_WEBHOOK_SECRET` | Optional | From Stripe webhook |
| `SMTP_HOST` | Optional | e.g. `smtp.resend.com` |
| `SMTP_USER` | Optional | e.g. `resend` |
| `SMTP_PASS` | Optional | Resend API key |

`JWT_SECRET` and `DATABASE_URL` are auto-set by the blueprint.

### 4. Redeploy after env vars

**invoiceflow-api → Manual Deploy → Deploy latest commit**

This ensures cross-service URLs (`ADMIN_APP_URL`, `NEXT_PUBLIC_API_URL`) are wired.

### 5. Create production users (do NOT run seed)

```bash
# Install Render CLI: brew install render
render login
render psql invoiceflow-db

# In psql, create a demo user via API register endpoint instead:
curl -X POST https://YOUR-API.onrender.com/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@invoiceflow.app","password":"demo1234","name":"Demo User","businessName":"Demo Co"}'
```

For App Store review, keep `demo@invoiceflow.app` / `demo1234` in production.

---

## URLs after deploy

| Service | Default URL |
|---------|-------------|
| API | `https://invoiceflow-api.onrender.com` |
| Admin + landing + portal | `https://invoiceflow-admin.onrender.com` |
| Client portal | `https://invoiceflow-admin.onrender.com/portal/{invoiceId}` |
| API health | `https://invoiceflow-api.onrender.com/health` |
| Swagger | `https://invoiceflow-api.onrender.com/api/docs` |

Update the **mobile app** production config (`apps/mobile/app.config.ts` or EAS secrets):

```env
EXPO_PUBLIC_API_URL=https://invoiceflow-api.onrender.com
EXPO_PUBLIC_PORTAL_URL=https://invoiceflow-admin.onrender.com/portal
```

---

## Custom domains (when `invoiceflow.app` is ready)

| Domain | Service |
|--------|---------|
| `api.invoiceflow.app` | `invoiceflow-api` |
| `invoiceflow.app` | `invoiceflow-admin` |

In Render → each service → **Settings → Custom Domains**, then add DNS CNAME records.

After custom domains are live, set:

```env
PORTAL_URL=https://invoiceflow.app/portal
```

on the API service (optional — `ADMIN_APP_URL` auto-derives portal URL).

---

## Render CLI quick reference

```bash
brew install render
render login
render services
render logs invoiceflow-api -f
render psql invoiceflow-db
render deploys create <service-id> --confirm
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API build fails on migrate | Check `invoiceflow-db` is running; view build logs |
| Admin can't reach API | Redeploy admin after API is live; verify `NEXT_PUBLIC_API_URL` |
| Portal payment links 404 | Confirm `ADMIN_APP_URL` on API points to admin service URL |
| Free Postgres expired | Upgrade `invoiceflow-db` to Basic in Render dashboard |
| Crons not running | Keep API on **Starter** plan (not Free — free spins down) |

---

## Files added for Render

- `render.yaml` — infrastructure blueprint
- `scripts/render-build-api.sh` — API build + `prisma migrate deploy`
- `scripts/render-build-admin.sh` — Next.js build
- `apps/api/prisma/migrations/` — initial production migration
