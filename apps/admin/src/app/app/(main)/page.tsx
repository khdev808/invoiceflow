'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { invoicesApi, notificationsApi, type DashboardStats, type Invoice } from '@/lib/appApi';
import { formatCurrency, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/app/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<Invoice[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    Promise.all([
      invoicesApi.dashboard(),
      invoicesApi.list(),
      notificationsApi.unreadCount().catch(() => 0),
    ]).then(([dash, list, count]) => {
      setStats(dash);
      setRecent(list.slice(0, 5));
      setUnread(typeof count === 'number' ? count : 0);
    });
  }, []);

  const currency = user?.currency || 'USD';

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-600">Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="mt-1 text-slate-500">{user?.businessName || 'Your business'}</p>
        </div>
        <Link
          href="/app/invoices/new"
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:opacity-95"
        >
          + Create invoice
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Revenue', value: formatCurrency(stats?.totalRevenue || 0, currency), color: 'text-emerald-600' },
          { label: 'Outstanding', value: formatCurrency(stats?.outstandingAmount || 0, currency), color: 'text-amber-600' },
          { label: 'Overdue', value: formatCurrency(stats?.overdueAmount || 0, currency), color: 'text-red-600' },
          { label: 'Expenses', value: formatCurrency(stats?.totalExpenses || 0, currency), color: 'text-indigo-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.label}</p>
            <p className={`mt-2 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Invoices', value: stats?.invoiceCount ?? '—' },
          { label: 'Paid', value: stats?.paidCount ?? '—' },
          { label: 'Clients', value: stats?.clientCount ?? '—' },
          { label: 'Unread alerts', value: unread },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold">Recent invoices</h2>
          <Link href="/app/invoices" className="text-sm font-medium text-indigo-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recent.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">No invoices yet. Create your first one!</p>
          ) : (
            recent.map((inv) => (
              <Link
                key={inv.id}
                href={`/app/invoices/${inv.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium">{inv.documentNumber}</p>
                  <p className="text-sm text-slate-500">{inv.client?.name || 'Client'} · {formatDate(inv.issueDate)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={inv.status} />
                  <span className="font-semibold">{formatCurrency(inv.total, inv.currency)}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
