import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';

type Props = {
  competitor: string;
  title: string;
  subtitle: string;
  bullets: string[];
};

export function AlternativePage({ competitor, title, subtitle, bullets }: Props) {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="text-sm transition-colors hover:underline hover:text-[var(--if-accent-dark)]"
          style={{ color: 'var(--if-accent-dark)' }}
        >
          ← InvoiceFlow
        </Link>
        <p
          className="mt-4 text-sm font-bold uppercase tracking-widest"
          style={{ color: 'var(--if-accent)' }}
        >
          {competitor} alternative
        </p>
        <h1 className="if-page-title mt-2">{title}</h1>
        <p className="if-subtitle text-lg">{subtitle}</p>

        <ul className="mt-8 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="if-card flex gap-3 p-4" style={{ color: 'var(--if-text)' }}>
              <span style={{ color: 'var(--if-success)' }}>✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/app/register" className="if-btn-primary px-6 py-3">
            Start free — no credit card
          </Link>
          <Link href="/help" className="if-btn-secondary px-6 py-3">
            See how it works
          </Link>
        </div>

        <p className="mt-8 text-sm" style={{ color: 'var(--if-muted)' }}>
          InvoiceFlow: professional invoices in under 60 seconds. Free plan with 25 invoices/month. Pro $9.99.
        </p>
      </div>
    </MarketingShell>
  );
}
