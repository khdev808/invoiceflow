'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { invoicesApi, type Invoice } from '@/lib/appApi';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { printInvoicePdf } from '@/lib/exportPdf';
import { AnalyticsEvents, trackEvent } from '@/lib/analytics';
import { StatusBadge } from '@/components/app/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { paymentMethods } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useAppLocale } from '@/lib/i18n/AppLocaleContext';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useAppLocale();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('manual');
  const [smsPhone, setSmsPhone] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    invoicesApi.get(id).then(setInvoice).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/portal/${id}` : `/portal/${id}`;

  const send = async () => {
    setActionLoading('send');
    try {
      await invoicesApi.send(id);
      trackEvent(AnalyticsEvents.INVOICE_SENT, { invoiceId: id });
      load();
    }
    catch (e: unknown) { setError(e instanceof Error ? e.message : t('sendFailed')); }
    finally { setActionLoading(''); }
  };

  const duplicate = async () => {
    setActionLoading('duplicate');
    try {
      const inv = await invoicesApi.duplicate(id);
      trackEvent(AnalyticsEvents.INVOICE_DUPLICATED, { sourceId: id });
      window.location.href = `/app/invoices/${inv.id}`;
    } catch (e: unknown) { setError(e instanceof Error ? e.message : t('duplicateFailed')); }
    finally { setActionLoading(''); }
  };

  const convert = async () => {
    setActionLoading('convert');
    try {
      const inv = await invoicesApi.convert(id);
      window.location.href = `/app/invoices/${inv.id}`;
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Convert failed'); }
    finally { setActionLoading(''); }
  };

  const recordPayment = async () => {
    const amount = Number(paymentAmount);
    if (!amount) return;
    setActionLoading('payment');
    try {
      await invoicesApi.recordPayment(id, { amount, method: paymentMethod });
      trackEvent(AnalyticsEvents.PAYMENT_RECORDED, { invoiceId: id, amount });
      setPaymentAmount('');
      load();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : t('paymentFailed')); }
    finally { setActionLoading(''); }
  };

  const copyPortal = async () => {
    await navigator.clipboard.writeText(portalUrl);
    alert(t('portalCopied'));
  };

  const sendSms = async () => {
    const phone = smsPhone.trim() || invoice?.client?.phone?.trim() || '';
    if (!phone) { setError('Enter a phone number or add one to the client.'); return; }
    setActionLoading('sms');
    try {
      const result = await invoicesApi.sendSms(id, phone);
      if (result.dev && result.telLink) {
        window.open(result.telLink, '_blank');
        alert(t('smsDevOpened'));
      } else if (result.sent) {
        alert(t('smsSent'));
        load();
      } else {
        setError(result.error || t('smsFailed'));
      }
    } catch (e: unknown) { setError(e instanceof Error ? e.message : t('smsFailed')); }
    finally { setActionLoading(''); }
  };

  if (loading) return <div className="flex h-48 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--if-accent)', borderTopColor: 'transparent' }} /></div>;
  if (!invoice) return <p className="text-red-600">{t('invoiceNotFound')}</p>;

  const paid = invoice.payments?.reduce((s, p) => s + p.amount, 0) || 0;
  const balance = invoice.total - paid;

  return (
    <div className="mx-auto max-w-5xl animate-fade-in">
      <PageHeader
        title={invoice.documentNumber}
        subtitle={`${invoice.client?.name} · ${formatDate(invoice.issueDate)}`}
        backHref="/app/invoices"
        actions={
          <>
            <StatusBadge status={invoice.status} />
            {invoice.status === 'DRAFT' ? (
              <Link href={`/app/invoices/${id}/edit`} className="if-btn-secondary">{t('edit')}</Link>
            ) : null}
          </>
        }
      />

      {error ? <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {(invoice.sentAt || invoice.viewedAt || invoice.status !== 'DRAFT') ? (
        <Card className="mb-6">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">{t('deliveryTracking')}</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-500">{t('emailLabel')}</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {invoice.sentAt
                  ? invoice.activities?.some((a) => a.action === 'EMAIL_DELIVERED')
                    ? `${invoice.client?.email || 'client'}`
                    : invoice.activities?.some((a) => a.action === 'EMAIL_FAILED')
                      ? t('sendFailed')
                      : `${invoice.client?.email || 'client'}`
                  : t('notSentYet')}
              </p>
              {invoice.sentAt ? <p className="mt-0.5 text-xs text-slate-500">{formatDateTime(invoice.sentAt)}</p> : null}
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-500">{t('opened')}</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {invoice.viewedAt ? t('clientViewedPortal') : invoice.sentAt ? t('notOpenedYet') : '—'}
              </p>
              {invoice.viewedAt ? <p className="mt-0.5 text-xs text-slate-500">{formatDateTime(invoice.viewedAt)}</p> : null}
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-500">{t('portalLink')}</p>
              <button type="button" onClick={copyPortal} className="mt-1 text-sm font-medium hover:underline" style={{ color: 'var(--if-accent-dark)' }}>
                {t('copyLink')}
              </button>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: t('total'), value: formatCurrency(invoice.total, invoice.currency), color: 'text-slate-900' },
          { label: t('paid'), value: formatCurrency(paid, invoice.currency), color: 'text-emerald-600' },
          { label: t('balance'), value: formatCurrency(balance, invoice.currency), color: 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="if-stat-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.label}</p>
            <p className={`mt-2 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {invoice.status === 'DRAFT' ? (
          <button type="button" onClick={send} disabled={!!actionLoading || !invoice.client?.email} className="if-btn-primary" title={!invoice.client?.email ? 'Add client email first' : undefined}>
            {actionLoading === 'send' ? t('sending') : t('sendToClient')}
          </button>
        ) : null}
        {invoice.status === 'DRAFT' && !invoice.client?.email ? (
          <p className="w-full text-sm text-amber-700">{t('addClientEmailFirst')}</p>
        ) : null}
        {invoice.documentType === 'ESTIMATE' ? (
          <button type="button" onClick={convert} disabled={!!actionLoading} className="if-btn-secondary">
            {t('convertToInvoice')}
          </button>
        ) : null}
        <button type="button" onClick={() => printInvoicePdf(invoice, user?.plan)} className="if-btn-secondary">{t('printPdf')}</button>
        <button type="button" onClick={duplicate} disabled={!!actionLoading} className="if-btn-secondary">
          {actionLoading === 'duplicate' ? t('duplicating') : t('duplicate')}
        </button>
        <button type="button" onClick={copyPortal} className="if-btn-secondary">{t('copyPortalLink')}</button>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <input
            type="tel"
            placeholder={invoice.client?.phone || t('phonePlaceholder')}
            value={smsPhone}
            onChange={(e) => setSmsPhone(e.target.value)}
            className="if-input max-w-xs"
          />
          <button type="button" onClick={sendSms} disabled={!!actionLoading} className="if-btn-secondary">
            {actionLoading === 'sms' ? t('sending') : t('sendSmsLink')}
          </button>
        </div>
        <a href={portalUrl} target="_blank" rel="noreferrer" className="if-btn-secondary">{t('previewPortal')}</a>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 !p-0 overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 font-semibold">{t('lineItemsTitle')}</div>
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">{t('description')}</th>
                <th className="px-4 py-3 text-center">{t('qtyHeader')}</th>
                <th className="px-4 py-3 text-right">{t('priceHeader')}</th>
                <th className="px-4 py-3 text-right">{t('lineTotal')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(invoice.lineItems || []).map((line, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 font-medium">{line.description}</td>
                  <td className="px-4 py-3 text-center">{line.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(line.unitPrice, invoice.currency)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(line.quantity * line.unitPrice, invoice.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="space-y-4">
          {balance > 0 && invoice.documentType === 'INVOICE' ? (
            <Card>
              <h3 className="font-semibold">{t('recordPayment')}</h3>
              <div className="mt-3 space-y-2">
                <input type="number" step="0.01" placeholder={t('amount')} value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="if-input" />
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="if-input">
                  {paymentMethods.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <button type="button" onClick={recordPayment} disabled={!!actionLoading} className="if-btn-primary w-full">
                  {t('recordPayment')}
                </button>
              </div>
            </Card>
          ) : null}

          {invoice.activities && invoice.activities.length > 0 ? (
            <Card>
              <h3 className="mb-3 font-semibold">{t('activity')}</h3>
              <div className="space-y-3">
                {invoice.activities.map((a) => (
                  <div key={a.id} className="border-l-2 pl-3" style={{ borderColor: 'var(--if-accent-soft)' }}>
                    <p className="text-sm font-medium">
                      {a.action === 'EMAIL_DELIVERED' ? 'Email delivered'
                        : a.action === 'EMAIL_FAILED' ? 'Email failed'
                        : a.action === 'EMAIL_DEV' ? 'Email logged (dev)'
                        : a.action === 'VIEWED' ? 'Client opened portal'
                        : a.action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                    </p>
                    <p className="text-xs text-slate-500">{formatDateTime(a.createdAt)}</p>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
