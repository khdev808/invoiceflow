'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { invoicesApi, type Invoice } from '@/lib/appApi';
import { formatCurrency, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/app/StatusBadge';
import { EmptyState } from '@/components/app/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { useAppLocale } from '@/lib/i18n/AppLocaleContext';
import type { AppTranslationKey } from '@/lib/i18n/app/en';

const FILTER_KEYS: { key: string; labelKey: AppTranslationKey }[] = [
  { key: 'all', labelKey: 'filterAll' },
  { key: 'draft', labelKey: 'filterDraft' },
  { key: 'sent', labelKey: 'filterSent' },
  { key: 'paid', labelKey: 'filterPaid' },
  { key: 'overdue', labelKey: 'filterOverdue' },
  { key: 'estimates', labelKey: 'filterEstimates' },
  { key: 'credit', labelKey: 'filterCredit' },
];

export default function InvoicesPage() {
  const { t } = useAppLocale();
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
    <div className="mx-auto max-w-6xl animate-fade-in">
      <PageHeader
        title={t('invoicesTitle')}
        subtitle={`${invoices.length} ${t('documents')}`}
        actions={
          <>
            <Link href="/app/invoices/new?type=CREDIT_NOTE" className="if-btn-secondary">+ {t('newCreditNote')}</Link>
            <Link href="/app/invoices/new?type=ESTIMATE" className="if-btn-secondary">+ {t('newEstimate')}</Link>
            <Link href="/app/invoices/new" className="if-btn-primary">+ {t('newInvoiceShort')}</Link>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTER_KEYS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === f.key ? 'if-btn-primary !py-1.5 !px-4' : 'if-btn-secondary !py-1.5 !px-4'
            }`}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--if-muted)' }}>{t('loading')}</p>
      ) : invoices.length === 0 ? (
        <EmptyState
          illustration="/illustrations/empty-invoices.svg"
          title={t('noInvoices')}
          description={t('noInvoicesHint')}
          action={
            <Link href="/app/invoices/new" className="if-btn-primary">
              {t('createInvoice')}
            </Link>
          }
        />
      ) : (
        <Card padding={false} className="overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="text-left" style={{ background: 'var(--if-bg)', color: 'var(--if-muted)' }}>
              <tr>
                <th className="px-4 py-3 font-semibold">Number</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--if-border)' }}>
              {invoices.map((inv) => (
                <tr key={inv.id} className="transition hover:bg-[var(--if-bg)]">
                  <td className="px-4 py-3">
                    <Link href={`/app/invoices/${inv.id}`} className="font-medium hover:underline" style={{ color: 'var(--if-accent-dark)' }}>
                      {inv.documentNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{inv.client?.name || '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--if-muted)' }}>{inv.documentType.replace('_', ' ')}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--if-muted)' }}>{formatDate(inv.issueDate)}</td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatCurrency(inv.total, inv.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
