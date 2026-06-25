'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { invoicesApi, type Invoice } from '@/lib/appApi';
import { formatCurrency, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/app/StatusBadge';
import { EmptyState } from '@/components/app/EmptyState';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'sent', label: 'Sent' },
  { key: 'paid', label: 'Paid' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'estimates', label: 'Estimates' },
  { key: 'credit', label: 'Credit' },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: { status?: string; type?: string } = {};
    if (filter === 'estimates') params.type = 'ESTIMATE';
    else if (filter === 'credit') params.type = 'CREDIT_NOTE';
    else if (filter !== 'all') params.status = filter.toUpperCase();
    invoicesApi.list(params).then(setInvoices).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-slate-500">{invoices.length} documents</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/app/invoices/new?type=ESTIMATE"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:border-indigo-200"
          >
            + Estimate
          </Link>
          <Link
            href="/app/invoices/new"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            + Invoice
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              filter === f.key ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="Create your first invoice and send it to a client in under a minute."
          action={
            <Link href="/app/invoices/new" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
              Create invoice
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Number</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/app/invoices/${inv.id}`} className="font-medium text-indigo-600 hover:underline">
                      {inv.documentNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{inv.client?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{inv.documentType.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(inv.issueDate)}</td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(inv.total, inv.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
