import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://invoiceflow-api-v1td.onrender.com';

const ENDPOINTS = [
  { method: 'POST', path: '/auth/login', auth: false, desc: 'Get JWT access token' },
  { method: 'POST', path: '/auth/register', auth: false, desc: 'Create account' },
  { method: 'GET', path: '/invoices', auth: true, desc: 'List invoices (optional ?status=, ?type=)' },
  { method: 'POST', path: '/invoices', auth: true, desc: 'Create invoice with line items' },
  { method: 'GET', path: '/invoices/:id', auth: true, desc: 'Get invoice with payments & activity' },
  { method: 'PUT', path: '/invoices/:id', auth: true, desc: 'Update draft invoice' },
  { method: 'POST', path: '/invoices/:id/send', auth: true, desc: 'Email invoice + PDF to client' },
  { method: 'POST', path: '/invoices/:id/sms', auth: true, desc: 'SMS portal link (body: { phone })' },
  { method: 'POST', path: '/invoices/:id/duplicate', auth: true, desc: 'Duplicate as new draft' },
  { method: 'POST', path: '/invoices/:id/payments', auth: true, desc: 'Record manual payment' },
  { method: 'GET', path: '/clients', auth: true, desc: 'List clients' },
  { method: 'POST', path: '/clients', auth: true, desc: 'Create client' },
  { method: 'GET', path: '/reports/export/quickbooks', auth: true, desc: 'QuickBooks CSV export' },
  { method: 'GET', path: '/time-entries/export/ics', auth: true, desc: 'Download billable time as .ics for Google Calendar' },
  { method: 'PUT', path: '/integrations/webhook', auth: true, desc: 'Set outbound webhook URL' },
];

export const metadata = {
  title: 'REST API — InvoiceFlow Developers',
  description: 'InvoiceFlow REST API reference for integrations, scripts, and Business tier automation.',
};

const linkClass = 'transition-colors hover:underline hover:text-[var(--if-accent-dark)]';

export default function ApiHelpPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/help" className={`text-sm ${linkClass}`} style={{ color: 'var(--if-accent-dark)' }}>
          ← Help & FAQ
        </Link>
        <h1 className="if-page-title mt-4">REST API</h1>
        <p className="if-subtitle">
          Automate invoicing with the InvoiceFlow API. Authenticate with a JWT from login, then call endpoints
          with{' '}
          <code className="rounded px-1" style={{ background: 'var(--if-accent-soft)' }}>
            Authorization: Bearer &lt;token&gt;
          </code>
          .
        </p>

        <section className="if-card mt-10 p-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--if-text)' }}>
            Base URL
          </h2>
          <pre
            className="mt-3 overflow-x-auto rounded-xl p-4 text-sm"
            style={{ background: 'var(--if-text)', color: 'var(--if-success)' }}
          >
            {API_BASE}
          </pre>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--if-text)' }}>
            Authentication
          </h2>
          <pre
            className="mt-3 overflow-x-auto rounded-xl p-4 text-xs"
            style={{ background: 'var(--if-text)', color: 'var(--if-bg)' }}
          >{`POST ${API_BASE}/auth/login
Content-Type: application/json

{ "email": "you@company.com", "password": "••••••" }

→ { "accessToken": "eyJ…", "user": { … } }`}</pre>
          <p className="mt-3 text-sm" style={{ color: 'var(--if-muted)' }}>
            Include the token on every request:{' '}
            <code className="rounded px-1" style={{ background: 'var(--if-accent-soft)' }}>
              Authorization: Bearer eyJ…
            </code>
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--if-text)' }}>
            Core endpoints
          </h2>
          <div className="mt-4 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--if-border)' }}>
            <table className="min-w-full text-sm">
              <thead
                className="text-left text-xs uppercase"
                style={{ background: 'var(--if-bg)', color: 'var(--if-muted)' }}
              >
                <tr>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Path</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--if-border)' }}>
                {ENDPOINTS.map((e) => (
                  <tr key={`${e.method}${e.path}`}>
                    <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--if-accent-dark)' }}>
                      {e.method}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--if-text)' }}>
                      {e.path}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--if-muted)' }}>
                      {e.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          className="mt-8 rounded-xl border p-6"
          style={{ borderColor: 'var(--if-border)', background: 'var(--if-bg)' }}
        >
          <h2 className="font-semibold" style={{ color: 'var(--if-text)' }}>
            Example: create &amp; send invoice
          </h2>
          <pre
            className="mt-3 overflow-x-auto rounded-xl p-4 text-xs"
            style={{ background: 'var(--if-text)', color: 'var(--if-bg)' }}
          >{`# 1. Create invoice
POST ${API_BASE}/invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientId": "clx…",
  "documentType": "INVOICE",
  "lineItems": [
    { "description": "Consulting", "quantity": 2, "unitPrice": 150, "taxRate": 0 }
  ]
}

# 2. Send to client (requires client email)
POST ${API_BASE}/invoices/{id}/send
Authorization: Bearer <token>`}</pre>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--if-text)' }}>
            Webhooks (outbound)
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--if-muted)' }}>
            For event-driven integrations without polling, configure a webhook URL in Settings → Integrations.
            See the{' '}
            <Link href="/help/integrations" className={linkClass} style={{ color: 'var(--if-accent-dark)' }}>
              Zapier &amp; webhooks guide
            </Link>
            .
          </p>
        </section>

        <section
          className="mt-8 rounded-xl border p-6"
          style={{ borderColor: 'var(--if-border)', background: 'var(--if-warning-soft)' }}
        >
          <h2 className="font-semibold" style={{ color: 'var(--if-warning)' }}>
            Business tier
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--if-text)' }}>
            Higher API rate limits and dedicated API keys are on the roadmap for Business plan customers.
            Contact{' '}
            <a href="mailto:support@invoiceflow.app" className="underline" style={{ color: 'var(--if-accent-dark)' }}>
              support@invoiceflow.app
            </a>{' '}
            for early access.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-4 text-sm" style={{ color: 'var(--if-accent-dark)' }}>
          <Link href="/app/login" className={linkClass}>
            Sign in to get a token
          </Link>
          <Link href="/help/integrations" className={linkClass}>
            Webhook events
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
