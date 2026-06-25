'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { invoicesApi, type Invoice } from '@/lib/appApi';
import { formatCurrency, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/app/StatusBadge';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
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
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Send failed');
    } finally {
      setActionLoading('');
    }
  };

  const convert = async () => {
    setActionLoading('convert');
    try {
      const inv = await invoicesApi.convert(id);
      window.location.href = `/app/invoices/${inv.id}`;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Convert failed');
    } finally {
      setActionLoading('');
    }
  };

  const recordPayment = async () => {
    const amount = Number(paymentAmount);
    if (!amount) return;
    setActionLoading('payment');
    try {
      await invoicesApi.recordPayment(id, { amount, method: 'manual' });
      setPaymentAmount('');
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Payment failed');
    } finally {
      setActionLoading('');
    }
  };

  const copyPortal = async () => {
    await navigator.clipboard.writeText(portalUrl);
    alert('Portal link copied!');
  };

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (!invoice) return <p className="text-sm text-red-600">Invoice not found</p>;

  const paid = invoice.payments?.reduce((s, p) => s + p.amount, 0) || 0;
  const balance = invoice.total - paid;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/app/invoices" className="text-sm text-indigo-600 hover:underline">← Invoices</Link>
          <h1 className="mt-2 text-3xl font-bold">{invoice.documentNumber}</h1>
          <p className="text-slate-500">{invoice.client?.name} · {formatDate(invoice.issueDate)}</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-2xl font-bold">{formatCurrency(invoice.total, invoice.currency)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Paid</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(paid, invoice.currency)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Balance</p>
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(balance, invoice.currency)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {invoice.status === 'DRAFT' ? (
          <button
            type="button"
            onClick={send}
            disabled={!!actionLoading}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            {actionLoading === 'send' ? 'Sending…' : 'Send to client'}
          </button>
        ) : null}
        {invoice.documentType === 'ESTIMATE' && invoice.status !== 'PAID' ? (
          <button
            type="button"
            onClick={convert}
            disabled={!!actionLoading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"
          >
            {actionLoading === 'convert' ? 'Converting…' : 'Convert to invoice'}
          </button>
        ) : null}
        <button type="button" onClick={copyPortal} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">
          Copy client portal link
        </button>
        <a href={portalUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">
          Preview portal
        </a>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4 font-semibold">Line items</div>
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Qty</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(invoice.lineItems || []).map((line, i) => (
              <tr key={i}>
                <td className="px-4 py-3">{line.description}</td>
                <td className="px-4 py-3">{line.quantity}</td>
                <td className="px-4 py-3">{formatCurrency(line.unitPrice, invoice.currency)}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatCurrency(line.quantity * line.unitPrice, invoice.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {balance > 0 && invoice.documentType === 'INVOICE' ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold">Record payment</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={recordPayment}
              disabled={!!actionLoading}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Record payment
            </button>
          </div>
        </div>
      ) : null}

      {invoice.notes ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Notes</p>
          <p className="mt-1 text-sm">{invoice.notes}</p>
        </div>
      ) : null}
    </div>
  );
}
