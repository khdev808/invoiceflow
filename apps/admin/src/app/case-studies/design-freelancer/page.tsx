import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';

export const metadata = {
  title: 'Case Study — Freelance Designer Saves 5 Hours/Month | InvoiceFlow',
  description: 'How a freelance designer switched from Invoice Fly to InvoiceFlow and cut invoicing time from 20 minutes to under 60 seconds per invoice.',
};

export default function DesignerCaseStudyPage() {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--if-accent-dark)' }}>
          Case study
        </p>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight">
          Freelance designer saves 5+ hours a month on invoicing
        </h1>
        <p className="mt-4 text-lg" style={{ color: 'var(--if-muted)' }}>
          Maria runs a one-person brand studio in Austin. She was on Invoice Fly until clients started asking for Apple Pay and faster portal links.
        </p>

        <section className="mt-10 space-y-6 leading-relaxed" style={{ color: 'var(--if-text)' }}>
          <h2 className="text-xl font-semibold">The problem</h2>
          <p style={{ color: 'var(--if-muted)' }}>
            Maria sent 12–18 invoices per month. Each one took about 20 minutes: duplicate an old PDF, fix line items, export, attach to email, chase payment on Venmo.
            Invoice Fly worked, but mobile editing was slow and clients wanted a single pay link with card wallets.
          </p>

          <h2 className="text-xl font-semibold">The switch</h2>
          <p style={{ color: 'var(--if-muted)' }}>
            She moved to InvoiceFlow in an afternoon. First invoice went out in 47 seconds: same client auto-filled, template she liked, portal link in the email.
            Two clients paid via Apple Pay the same week — something she could not offer before without a separate Stripe setup.
          </p>

          <div className="if-card" style={{ background: 'var(--if-success-soft)' }}>
            <p className="text-2xl font-semibold" style={{ color: 'var(--if-success)' }}>~5 hours saved / month</p>
            <p className="mt-2 text-sm" style={{ color: 'var(--if-muted)' }}>
              15 invoices × 19 minutes saved ≈ 4.75 hours, plus faster payment collection.
            </p>
          </div>

          <h2 className="text-xl font-semibold">What she uses daily</h2>
          <ul className="list-disc space-y-2 pl-5" style={{ color: 'var(--if-muted)' }}>
            <li>Mobile app to invoice from client meetings</li>
            <li>Duplicate invoice + last-client shortcut</li>
            <li>Client portal with Stripe (cards + Apple Pay)</li>
            <li>WhatsApp share when email is slow</li>
            <li>Time entries → invoice line items for retainer overages</li>
          </ul>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/app/register" className="if-btn-primary">
            Try InvoiceFlow free
          </Link>
          <Link href="/alternatives/invoice-fly" className="if-btn-secondary">
            Compare vs Invoice Fly
          </Link>
        </div>
      </article>
    </MarketingShell>
  );
}
