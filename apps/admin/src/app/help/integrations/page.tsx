import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';

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

const linkClass = 'transition-colors hover:underline hover:text-[var(--if-accent-dark)]';

export default function IntegrationsHelpPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/help" className={`text-sm ${linkClass}`} style={{ color: 'var(--if-accent-dark)' }}>
          ← Help & FAQ
        </Link>
        <h1 className="if-page-title mt-4">Zapier, Make & webhooks</h1>
        <p className="if-subtitle">
          InvoiceFlow can POST JSON events to any HTTPS URL you configure. Use this with{' '}
          <strong>Zapier Webhooks</strong>, <strong>Make (Integromat)</strong>, n8n, or your own API.
        </p>

        <section className="if-card mt-10 p-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--if-text)' }}>
            Setup (2 minutes)
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm" style={{ color: 'var(--if-text)' }}>
            <li>
              In Zapier, create a Zap → trigger <strong>Webhooks by Zapier</strong> →{' '}
              <strong>Catch Hook</strong>. Copy the webhook URL.
            </li>
            <li>
              Sign in to InvoiceFlow →{' '}
              <Link href="/app/settings" className={linkClass} style={{ color: 'var(--if-accent-dark)' }}>
                Settings
              </Link>{' '}
              → <strong>Integrations</strong> → paste the URL → Save.
            </li>
            <li>
              Click <strong>Send test</strong> — Zapier should receive an{' '}
              <code className="rounded px-1" style={{ background: 'var(--if-accent-soft)' }}>
                integration.test
              </code>{' '}
              event.
            </li>
            <li>Add actions (Slack, Google Sheets, email, etc.) and turn the Zap on.</li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--if-text)' }}>
            Event types
          </h2>
          <div className="mt-4 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--if-border)' }}>
            <table className="min-w-full text-sm">
              <thead
                className="text-left text-xs uppercase"
                style={{ background: 'var(--if-bg)', color: 'var(--if-muted)' }}
              >
                <tr>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">When it fires</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--if-border)' }}>
                {EVENTS.map((e) => (
                  <tr key={e.name}>
                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--if-accent-dark)' }}>
                      {e.name}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--if-muted)' }}>
                      {e.when}
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
            Payload format
          </h2>
          <pre
            className="mt-3 overflow-x-auto rounded-xl p-4 text-xs"
            style={{ background: 'var(--if-text)', color: 'var(--if-bg)' }}
          >{`POST https://your-webhook-url
Content-Type: application/json

{
  "event": "invoice.sent",
  "timestamp": "2026-06-24T12:00:00.000Z",
  "payload": {
    "invoiceId": "clx…",
    "documentNumber": "INV-1001"
  }
}`}</pre>
          <p className="mt-3 text-sm" style={{ color: 'var(--if-muted)' }}>
            Webhooks are sent from the server when events occur. Failed deliveries are logged but not retried
            automatically yet.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--if-text)' }}>
            Example Zaps
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm" style={{ color: 'var(--if-text)' }}>
            <li>
              <strong>invoice.sent</strong> → Slack: “Invoice INV-1001 sent to Acme Corp”
            </li>
            <li>
              <strong>invoice.viewed</strong> → SMS yourself when a client opens the portal
            </li>
            <li>
              <strong>payment.received</strong> → Add row to Google Sheets revenue tracker
            </li>
          </ul>
        </section>

        <div className="mt-10 flex flex-wrap gap-4 text-sm" style={{ color: 'var(--if-accent-dark)' }}>
          <Link href="/app/settings" className={linkClass}>
            Configure webhook in app
          </Link>
          <Link href="/help" className={linkClass}>
            Back to FAQ
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
