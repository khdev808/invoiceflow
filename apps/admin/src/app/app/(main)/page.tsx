'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { invoicesApi, notificationsApi, type DashboardStats, type Invoice } from '@/lib/appApi';
import { formatCurrency, formatDate } from '@/lib/format';
import { getLastClientId } from '@/lib/invoicePrefs';
import { StatusBadge } from '@/components/app/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useAppLocale } from '@/lib/i18n/AppLocaleContext';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useAppLocale();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([invoicesApi.dashboard(), invoicesApi.list()])
      .then(([dash, list]) => {
        setStats(dash);
        setInvoices(list);
      })
      .catch(() => setError('Failed to load dashboard. Try refreshing the page.'))
      .finally(() => setLoading(false));
  }, []);

  const currency = user?.currency || 'USD';
  const firstName = user?.name?.split(' ')[0] || 'there';
  const [lastClientId, setLastClientId] = useState<string | null>(null);

  useEffect(() => {
    setLastClientId(getLastClientId());
  }, []);

  const attention = invoices
    .filter((i) => i.status === 'OVERDUE' || i.status === 'SENT' || i.status === 'VIEWED')
    .sort((a, b) => (a.status === 'OVERDUE' ? -1 : 1))
    .slice(0, 3);

  const heroValue =
    (stats?.outstandingAmount || 0) > 0
      ? { label: 'Outstanding', value: formatCurrency(stats?.outstandingAmount || 0, currency) }
      : { label: 'Revenue', value: formatCurrency(stats?.totalRevenue || 0, currency) };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl py-16 text-center text-sm" style={{ color: 'var(--if-muted)' }}>
        {t('loading')}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <PageHeader
        title={`${greeting()}, ${firstName}`}
        subtitle={user?.businessName || 'Your ledger at a glance'}
        actions={
          <div className="flex flex-wrap gap-2">
            {lastClientId ? (
              <Link href={`/app/invoices/new?clientId=${lastClientId}`} className="if-btn-secondary">
                {t('invoiceLastClient')}
              </Link>
            ) : null}
            <Link href="/app/invoices/new" className="if-btn-primary">
              {t('createInvoice')}
            </Link>
          </div>
        }
      />

      {error ? (
        <p className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ background: 'var(--if-danger-soft)', color: 'var(--if-danger)' }}>
          {error}
        </p>
      ) : null}

      <div className="if-stat-card mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--if-muted)' }}>
          {heroValue.label}
        </p>
        <p className="font-display mt-2 text-4xl font-semibold tracking-tight" style={{ color: 'var(--if-text)' }}>
          {heroValue.value}
        </p>
      </div>

      {attention.length > 0 ? (
        <div className="if-card mb-8 overflow-hidden !p-0">
          <div className="flex items-center gap-2 border-b px-6 py-4" style={{ borderColor: 'var(--if-border)' }}>
            <AlertCircle className="h-4 w-4" style={{ color: 'var(--if-accent)' }} />
            <h2 className="font-semibold">Needs attention</h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--if-border)' }}>
            {attention.map((inv) => (
              <Link
                key={inv.id}
                href={`/app/invoices/${inv.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition hover:bg-[var(--if-accent-soft)]/40"
              >
                <div>
                  <p className="font-semibold">{inv.documentNumber}</p>
                  <p className="text-sm" style={{ color: 'var(--if-muted)' }}>
                    {inv.client?.name} · {formatDate(inv.issueDate)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={inv.status} />
                  <span className="font-bold">{formatCurrency(inv.total, inv.currency)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Invoices', value: stats?.invoiceCount ?? '—', href: '/app/invoices', icon: Clock },
          { label: 'Paid', value: stats?.paidCount ?? '—', href: '/app/invoices?filter=paid', icon: TrendingUp },
          { label: 'Clients', value: stats?.clientCount ?? '—', href: '/app/clients', icon: TrendingUp },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="if-stat-card transition hover:border-[var(--if-accent)]/30"
          >
            <p className="text-xs" style={{ color: 'var(--if-muted)' }}>{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="if-card overflow-hidden !p-0">
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--if-border)' }}>
          <h2 className="font-semibold">Recent invoices</h2>
          <Link href="/app/invoices" className="text-sm font-semibold hover:underline" style={{ color: 'var(--if-accent-dark)' }}>
            View all
          </Link>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--if-border)' }}>
          {invoices.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p style={{ color: 'var(--if-muted)' }}>Your ledger starts here.</p>
              <Link href="/app/invoices/new" className="mt-3 inline-block text-sm font-semibold if-btn-primary">
                Create your first invoice
              </Link>
            </div>
          ) : (
            invoices.slice(0, 5).map((inv) => (
              <Link
                key={inv.id}
                href={`/app/invoices/${inv.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition hover:bg-[var(--if-accent-soft)]/40"
              >
                <div>
                  <p className="font-semibold">{inv.documentNumber}</p>
                  <p className="text-sm" style={{ color: 'var(--if-muted)' }}>
                    {inv.client?.name} · {formatDate(inv.issueDate)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={inv.status} />
                  <span className="font-bold">{formatCurrency(inv.total, inv.currency)}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
