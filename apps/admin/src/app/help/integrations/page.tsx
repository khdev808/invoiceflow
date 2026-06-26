import Link from 'next/link';

const EVENTS = [
  { name: 'integration.test', when: 'You click “Send test” in Settings → Integrations' },
  { name: 'invoice.sent', when: 'An invoice is emailed to a client' },
  { name: 'invoice.viewed', when: 'A client opens the portal link' },
  { name: 'payment.received', when: 'Stripe, Apple Pay, Google Pay, or PayPal payment succeeds' },
];

export const metadata = {
  title: 'Zapier & Webhooks — InvoiceFlow Integrations',
  description: 'Connect InvoiceFlow to Zapier, Make, or your own backend using outbound webhooks.',
};

export default function IntegrationsHelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/help" className="text-sm text-indigo-600 hover:underline">← Help & FAQ</Link>
      <h1 className="mt-4 text-3xl font-bold">Zapier, Make & webhooks</h1>
      <p className="mt-2 text-slate-600">
        InvoiceFlow can POST JSON events to any HTTPS URL you configure. Use this with{' '}
        <strong>Zapier Webhooks</strong>, <strong>Make (Integromat)</strong>, n8n, or your own API.
      </p>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Setup (2 minutes)</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>In Zapier, create a Zap → trigger <strong>Webhooks by Zapier</strong> → <strong>Catch Hook</strong>. Copy the webhook URL.</li>
          <li>Sign in to InvoiceFlow → <Link href="/app/settings" className="text-indigo-600 hover:underline">Settings</Link> → <strong>Integrations</strong> → paste the URL → Save.</li>
          <li>Click <strong>Send test</strong> — Zapier should receive an <code className="rounded bg-slate-100 px-1">integration.test</code> event.</li>
          <li>Add actions (Slack, Google Sheets, email, etc.) and turn the Zap on.</li>
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Event types</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">When it fires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {EVENTS.map((e) => (
                <tr key={e.name}>
                  <td className="px-4 py-3 font-mono text-indigo-700">{e.name}</td>
                  <td className="px-4 py-3 text-slate-600">{e.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="font-semibold">Payload format</h2>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">{`POST https://your-webhook-url
Content-Type: application/json

{
  "event": "invoice.sent",
  "timestamp": "2026-06-24T12:00:00.000Z",
  "payload": {
    "invoiceId": "clx…",
    "documentNumber": "INV-1001"
  }
}`}</pre>
        <p className="mt-3 text-sm text-slate-600">
          Webhooks are sent from the server when events occur. Failed deliveries are logged but not retried automatically yet.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Example Zaps</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li><strong>invoice.sent</strong> → Slack: “Invoice INV-1001 sent to Acme Corp”</li>
          <li><strong>invoice.viewed</strong> → SMS yourself when a client opens the portal</li>
          <li><strong>payment.received</strong> → Add row to Google Sheets revenue tracker</li>
        </ul>
      </section>

      <div className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link href="/app/settings" className="text-indigo-600 hover:underline">Configure webhook in app</Link>
        <Link href="/help" className="text-indigo-600 hover:underline">Back to FAQ</Link>
      </div>
    </div>
  );
}
