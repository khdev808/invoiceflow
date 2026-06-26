import Link from 'next/link';

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
  { method: 'PUT', path: '/integrations/webhook', auth: true, desc: 'Set outbound webhook URL' },
];

export const metadata = {
  title: 'REST API — InvoiceFlow Developers',
  description: 'InvoiceFlow REST API reference for integrations, scripts, and Business tier automation.',
};

export default function ApiHelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/help" className="text-sm text-indigo-600 hover:underline">← Help & FAQ</Link>
      <h1 className="mt-4 text-3xl font-bold">REST API</h1>
      <p className="mt-2 text-slate-600">
        Automate invoicing with the InvoiceFlow API. Authenticate with a JWT from login, then call endpoints with{' '}
        <code className="rounded bg-slate-100 px-1">Authorization: Bearer &lt;token&gt;</code>.
      </p>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Base URL</h2>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-emerald-300">{API_BASE}</pre>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Authentication</h2>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">{`POST ${API_BASE}/auth/login
Content-Type: application/json

{ "email": "you@company.com", "password": "••••••" }

→ { "accessToken": "eyJ…", "user": { … } }`}</pre>
        <p className="mt-3 text-sm text-slate-600">
          Include the token on every request: <code className="rounded bg-slate-100 px-1">Authorization: Bearer eyJ…</code>
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Core endpoints</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Path</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ENDPOINTS.map((e) => (
                <tr key={`${e.method}${e.path}`}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-700">{e.method}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-800">{e.path}</td>
                  <td className="px-4 py-3 text-slate-600">{e.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="font-semibold">Example: create &amp; send invoice</h2>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">{`# 1. Create invoice
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
        <h2 className="text-lg font-semibold">Webhooks (outbound)</h2>
        <p className="mt-2 text-sm text-slate-600">
          For event-driven integrations without polling, configure a webhook URL in Settings → Integrations.
          See the <Link href="/help/integrations" className="text-indigo-600 hover:underline">Zapier &amp; webhooks guide</Link>.
        </p>
      </section>

      <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-semibold text-amber-900">Business tier</h2>
        <p className="mt-2 text-sm text-amber-800">
          Higher API rate limits and dedicated API keys are on the roadmap for Business plan customers.
          Contact <a href="mailto:support@invoiceflow.app" className="underline">support@invoiceflow.app</a> for early access.
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link href="/app/login" className="text-indigo-600 hover:underline">Sign in to get a token</Link>
        <Link href="/help/integrations" className="text-indigo-600 hover:underline">Webhook events</Link>
      </div>
    </div>
  );
}
