import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';

const linkClass = 'transition-colors hover:underline hover:text-[var(--if-accent-dark)]';

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className={`text-sm ${linkClass}`} style={{ color: 'var(--if-accent-dark)' }}>
          ← Home
        </Link>
        <h1 className="if-page-title mt-4">Privacy Policy</h1>
        <p className="text-sm" style={{ color: 'var(--if-muted)' }}>
          Last updated: June 2026
        </p>
        <div className="mt-8 space-y-6" style={{ color: 'var(--if-text)' }}>
          <section>
            <h2 className="text-lg font-semibold">What we collect</h2>
            <p className="mt-2 leading-relaxed" style={{ color: 'var(--if-muted)' }}>
              InvoiceFlow (&quot;we&quot;) collects account information (name, email, business details) and invoice
              data you create to provide our invoicing service. We also collect usage analytics when enabled to
              improve the product.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Payments</h2>
            <p className="mt-2 leading-relaxed" style={{ color: 'var(--if-muted)' }}>
              Payment processing is handled by Stripe and PayPal. We do not store full card numbers on our
              servers.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">How we use data</h2>
            <p className="mt-2 leading-relaxed" style={{ color: 'var(--if-muted)' }}>
              We use your data to operate the service, send payment reminders you configure, and improve the
              product. We do not sell your personal data to third parties.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">GDPR & your rights (EEA/UK)</h2>
            <p className="mt-2 leading-relaxed" style={{ color: 'var(--if-muted)' }}>
              If you are in the EEA or UK, you have the right to access, correct, export, or delete your personal
              data. To exercise these rights, email{' '}
              <a href="mailto:privacy@invoiceflow.app" className={linkClass} style={{ color: 'var(--if-accent-dark)' }}>
                privacy@invoiceflow.app
              </a>
              . You may lodge a complaint with your local data protection authority.
            </p>
            <p className="mt-2 leading-relaxed" style={{ color: 'var(--if-muted)' }}>
              Our lawful basis for processing is contract performance (providing the service) and legitimate
              interests (security, analytics, product improvement).
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Data retention</h2>
            <p className="mt-2 leading-relaxed" style={{ color: 'var(--if-muted)' }}>
              Active account data is retained while your account exists. After account deletion, we remove personal
              data within 30 days except where retention is required by law (e.g. billing records). Invoice PDFs
              and audit logs may be retained up to 7 years where tax law requires.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Cookies & analytics</h2>
            <p className="mt-2 leading-relaxed" style={{ color: 'var(--if-muted)' }}>
              We use essential cookies for authentication. Optional analytics (PostHog) may use local storage when
              you use the web app and analytics keys are configured.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Contact</h2>
            <p className="mt-2 leading-relaxed" style={{ color: 'var(--if-muted)' }}>
              Privacy inquiries:{' '}
              <a href="mailto:privacy@invoiceflow.app" className={linkClass} style={{ color: 'var(--if-accent-dark)' }}>
                privacy@invoiceflow.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </MarketingShell>
  );
}
