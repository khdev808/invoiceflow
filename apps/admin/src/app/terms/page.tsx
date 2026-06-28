import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';

const linkClass = 'transition-colors hover:underline hover:text-[var(--if-accent-dark)]';

export default function TermsPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className={`text-sm ${linkClass}`} style={{ color: 'var(--if-accent-dark)' }}>
          ← Home
        </Link>
        <h1 className="if-page-title mt-4">Terms of Service</h1>
        <p className="text-sm" style={{ color: 'var(--if-muted)' }}>
          Last updated: June 2026
        </p>
        <div className="mt-8 space-y-6" style={{ color: 'var(--if-text)' }}>
          <section>
            <h2 className="text-lg font-semibold">Agreement</h2>
            <p className="mt-2 leading-relaxed" style={{ color: 'var(--if-muted)' }}>
              By using InvoiceFlow you agree to these terms. InvoiceFlow provides invoicing software for
              freelancers and small businesses.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Your responsibilities</h2>
            <p className="mt-2 leading-relaxed" style={{ color: 'var(--if-muted)' }}>
              You are responsible for the accuracy of invoices you send and for complying with tax laws in your
              jurisdiction. You must not use the service for fraudulent or illegal activity.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Plans & billing</h2>
            <p className="mt-2 leading-relaxed" style={{ color: 'var(--if-muted)' }}>
              Free and paid plans are subject to usage limits described on our pricing page. Paid subscriptions
              renew automatically until cancelled. We may update features and pricing with reasonable notice.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Availability</h2>
            <p className="mt-2 leading-relaxed" style={{ color: 'var(--if-muted)' }}>
              We aim for high uptime but do not guarantee uninterrupted service. Scheduled maintenance may occur
              with notice when possible.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Limitation of liability</h2>
            <p className="mt-2 leading-relaxed" style={{ color: 'var(--if-muted)' }}>
              The service is provided &quot;as is&quot; without warranty. InvoiceFlow is not liable for indirect
              damages, lost profits, or tax penalties arising from your use of the service.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Contact</h2>
            <p className="mt-2 leading-relaxed" style={{ color: 'var(--if-muted)' }}>
              Legal inquiries:{' '}
              <a href="mailto:legal@invoiceflow.app" className={linkClass} style={{ color: 'var(--if-accent-dark)' }}>
                legal@invoiceflow.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </MarketingShell>
  );
}
