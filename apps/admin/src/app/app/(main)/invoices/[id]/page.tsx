'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { invoicesApi, type Invoice } from '@/lib/appApi';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { printInvoicePdf } from '@/lib/exportPdf';
import { StatusBadge } from '@/components/app/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { paymentMethods } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('manual');
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    invoicesApi.get(id).then(setInvoice).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/portal/${id}` : `/portal/${id}`;

  const send = async () => {
    setActionLoading('send');
    try { await invoicesApi.send(id); load(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Send failed'); }
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
      setPaymentAmount('');
      load();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Payment failed'); }
    finally { setActionLoading(''); }
  };

  const copyPortal = async () => {
    await navigator.clipboard.writeText(portalUrl);
    alert('Portal link copied!');
  };

  if (loading) return <div className="flex h-48 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>;
  if (!invoice) return <p className="text-red-600">Invoice not found</p>;

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
              <Link href={`/app/invoices/${id}/edit`} className="if-btn-secondary">Edit</Link>
            ) : null}
          </>
        }
      />

      {error ? <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total', value: formatCurrency(invoice.total, invoice.currency), color: 'text-slate-900' },
          { label: 'Paid', value: formatCurrency(paid, invoice.currency), color: 'text-emerald-600' },
          { label: 'Balance', value: formatCurrency(balance, invoice.currency), color: 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="if-stat-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.label}</p>
            <p className={`mt-2 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {invoice.status === 'DRAFT' ? (
          <button type="button" onClick={send} disabled={!!actionLoading} className="if-btn-primary">
            {actionLoading === 'send' ? 'Sending…' : 'Send to client'}
          </button>
        ) : null}
        {invoice.documentType === 'ESTIMATE' ? (
          <button type="button" onClick={convert} disabled={!!actionLoading} className="if-btn-secondary">
            Convert to invoice
          </button>
        ) : null}
        <button type="button" onClick={() => printInvoicePdf(invoice, user?.plan)} className="if-btn-secondary">Print / PDF</button>
        <button type="button" onClick={copyPortal} className="if-btn-secondary">Copy portal link</button>
        <a href={portalUrl} target="_blank" rel="noreferrer" className="if-btn-secondary">Preview portal</a>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 !p-0 overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 font-semibold">Line items</div>
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Total</th>
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
              <h3 className="font-semibold">Record payment</h3>
              <div className="mt-3 space-y-2">
                <input type="number" step="0.01" placeholder="Amount" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="if-input" />
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="if-input">
                  {paymentMethods.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <button type="button" onClick={recordPayment} disabled={!!actionLoading} className="if-btn-primary w-full">
                  Record payment
                </button>
              </div>
            </Card>
          ) : null}

          {invoice.activities && invoice.activities.length > 0 ? (
            <Card>
              <h3 className="mb-3 font-semibold">Activity</h3>
              <div className="space-y-3">
                {invoice.activities.map((a) => (
                  <div key={a.id} className="border-l-2 border-indigo-200 pl-3">
                    <p className="text-sm font-medium capitalize">{a.action.toLowerCase().replace('_', ' ')}</p>
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
