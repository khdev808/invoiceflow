'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { invoicesApi, notificationsApi, type DashboardStats, type Invoice } from '@/lib/appApi';
import { formatCurrency, formatDate } from '@/lib/format';
import { getLastClientId } from '@/lib/invoicePrefs';
import { StatusBadge } from '@/components/app/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<Invoice[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      invoicesApi.dashboard(),
      invoicesApi.list(),
      notificationsApi.unreadCount().catch(() => 0),
    ])
      .then(([dash, list, count]) => {
        setStats(dash);
        setRecent(list.slice(0, 5));
        setUnread(typeof count === 'number' ? count : 0);
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

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl py-16 text-center text-sm text-slate-500">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <PageHeader
        title={`Welcome back, ${firstName} 👋`}
        subtitle={user?.businessName || 'Your business dashboard'}
        actions={
          <div className="flex flex-wrap gap-2">
            {lastClientId ? (
              <Link href={`/app/invoices/new?clientId=${lastClientId}`} className="if-btn-secondary">
                Invoice last client
              </Link>
            ) : null}
            <Link href="/app/invoices/new" className="if-btn-primary shadow-lg">
              + Create invoice
            </Link>
          </div>
        }
      />

      {error ? <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Revenue', value: formatCurrency(stats?.totalRevenue || 0, currency), icon: '📈', tone: 'text-emerald-600', bg: 'from-emerald-50 to-white' },
          { label: 'Outstanding', value: formatCurrency(stats?.outstandingAmount || 0, currency), icon: '⏳', tone: 'text-amber-600', bg: 'from-amber-50 to-white' },
          { label: 'Overdue', value: formatCurrency(stats?.overdueAmount || 0, currency), icon: '⚠️', tone: 'text-red-600', bg: 'from-red-50 to-white' },
          { label: 'Expenses', value: formatCurrency(stats?.totalExpenses || 0, currency), icon: '🧾', tone: 'text-indigo-600', bg: 'from-indigo-50 to-white' },
        ].map((s) => (
          <div key={s.label} className={`if-stat-card bg-gradient-to-br ${s.bg}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{s.label}</p>
              <span className="text-lg">{s.icon}</span>
            </div>
            <p className={`mt-3 text-2xl font-extrabold ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-4">
        {[
          { label: 'Invoices', value: stats?.invoiceCount ?? '—', href: '/app/invoices' },
          { label: 'Paid', value: stats?.paidCount ?? '—', href: '/app/invoices?filter=paid' },
          { label: 'Clients', value: stats?.clientCount ?? '—', href: '/app/clients' },
          { label: 'Alerts', value: unread, href: '/app/notifications' },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="if-stat-card transition hover:border-indigo-200 hover:shadow-md">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="if-card overflow-hidden !p-0">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-bold">Recent invoices</h2>
          <Link href="/app/invoices" className="text-sm font-semibold text-indigo-600 hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recent.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-500">No invoices yet.</p>
              <Link href="/app/invoices/new" className="mt-3 inline-block text-sm font-semibold text-indigo-600">Create your first invoice →</Link>
            </div>
          ) : (
            recent.map((inv) => (
              <Link key={inv.id} href={`/app/invoices/${inv.id}`} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition hover:bg-indigo-50/40">
                <div>
                  <p className="font-semibold">{inv.documentNumber}</p>
                  <p className="text-sm text-slate-500">{inv.client?.name} · {formatDate(inv.issueDate)}</p>
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
