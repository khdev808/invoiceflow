import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';

const FAQ = [
  {
    q: 'How do I create my first invoice?',
    a: 'Sign up, add a client under Clients, then click + Invoice. Pick your client, add line items, and save. Use Send to email the client a portal link.',
  },
  {
    q: 'How do clients pay?',
    a: 'When you send an invoice, your client gets an email with a link to the client portal where they can view the invoice and pay via Stripe or PayPal (when configured).',
  },
  {
    q: 'What is included in the free plan?',
    a: 'The free plan includes core invoicing with monthly limits. Upgrade to Pro or Business for higher limits, premium templates, and advanced features.',
  },
  {
    q: 'How do I connect Stripe?',
    a: 'Add your Stripe keys in Settings → Payments. For subscriptions, use the Upgrade flow in Settings → Plan.',
  },
  {
    q: 'Can I duplicate an existing invoice?',
    a: 'Yes. Open any invoice and click Duplicate to create a new draft with the same client and line items.',
  },
  {
    q: 'How do I reset my password?',
    a: 'Use Forgot password on the sign-in page. You will receive an email with a reset link (requires SMTP configured in production).',
  },
  {
    q: 'How do I delete my account or data?',
    a: 'Email support@invoiceflow.app with your account email. We process deletion requests within 30 days per our privacy policy.',
  },
];

const linkClass = 'transition-colors hover:underline hover:text-[var(--if-accent-dark)]';

export default function HelpPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className={`text-sm ${linkClass}`} style={{ color: 'var(--if-accent-dark)' }}>
          ← Home
        </Link>
        <h1 className="if-page-title mt-4">Help & FAQ</h1>
        <p className="if-subtitle">
          Quick answers for InvoiceFlow. Need more help? Email{' '}
          <a href="mailto:support@invoiceflow.app" className={linkClass} style={{ color: 'var(--if-accent-dark)' }}>
            support@invoiceflow.app
          </a>
          .
        </p>

        <div className="mt-10 space-y-6">
          {FAQ.map((item) => (
            <div key={item.q} className="if-card p-6">
              <h2 className="font-semibold" style={{ color: 'var(--if-text)' }}>
                {item.q}
              </h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--if-muted)' }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm" style={{ color: 'var(--if-accent-dark)' }}>
          <Link href="/app/login" className={linkClass}>
            Sign in to the app
          </Link>
          <Link href="/help/integrations" className={linkClass}>
            Zapier & webhooks
          </Link>
          <Link href="/help/api" className={linkClass}>
            REST API
          </Link>
          <Link href="/privacy" className={linkClass}>
            Privacy policy
          </Link>
          <Link href="/terms" className={linkClass}>
            Terms of service
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
