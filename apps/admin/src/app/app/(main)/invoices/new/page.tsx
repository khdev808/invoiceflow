'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { clientsApi, invoicesApi, productsApi, type Client, type LineItem } from '@/lib/appApi';
import { calcLineTotal, formatCurrency } from '@/lib/format';
import { useAuth } from '@/contexts/AuthContext';

function NewInvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docType = searchParams.get('type') === 'ESTIMATE' ? 'ESTIMATE' : 'INVOICE';
  const paramClientId = searchParams.get('clientId');
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('Payment due within 30 days.');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([clientsApi.list(), productsApi.list()]).then(([c]) => {
      setClients(c);
      if (paramClientId && c.some((x) => x.id === paramClientId)) setClientId(paramClientId);
      else if (c.length > 0) setClientId(c[0].id);
    });
  }, [paramClientId]);

  const total = lineItems.reduce((s, item) => s + calcLineTotal(item), 0);

  const updateLine = (index: number, patch: Partial<LineItem>) => {
    setLineItems((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const addLine = () => {
    setLineItems((items) => [...items, { description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }]);
  };

  const removeLine = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((items) => items.filter((_, i) => i !== index));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError('Please add a client first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const inv = await invoicesApi.create({
        clientId,
        documentType: docType,
        dueDate: docType === 'INVOICE' ? dueDate : undefined,
        currency,
        notes,
        terms,
        lineItems: lineItems.filter((l) => l.description.trim()),
      });
      router.push(`/app/invoices/${inv.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/app/invoices" className="text-sm text-indigo-600 hover:underline">← Back to invoices</Link>
        <h1 className="mt-2 text-3xl font-bold">New {docType === 'ESTIMATE' ? 'estimate' : 'invoice'}</h1>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          You need at least one client.{' '}
          <Link href="/app/clients/new" className="font-semibold underline">Add a client</Link>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-6">
        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Client</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {docType === 'INVOICE' ? (
              <div>
                <label className="mb-1 block text-sm font-medium">Due date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Line items</h2>
            <button type="button" onClick={addLine} className="text-sm font-medium text-indigo-600">+ Add line</button>
          </div>
          <div className="space-y-3">
            {lineItems.map((line, i) => (
              <div key={i} className="grid gap-2 rounded-xl bg-slate-50 p-3 md:grid-cols-12">
                <input
                  placeholder="Description"
                  value={line.description}
                  onChange={(e) => updateLine(i, { description: e.target.value })}
                  className="md:col-span-4 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  required
                />
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Qty"
                  value={line.quantity}
                  onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })}
                  className="md:col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Price"
                  value={line.unitPrice}
                  onChange={(e) => updateLine(i, { unitPrice: Number(e.target.value) })}
                  className="md:col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Tax %"
                  value={line.taxRate}
                  onChange={(e) => updateLine(i, { taxRate: Number(e.target.value) })}
                  className="md:col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <div className="flex items-center justify-between md:col-span-2">
                  <span className="text-sm font-medium">{formatCurrency(calcLineTotal(line), currency)}</span>
                  <button type="button" onClick={() => removeLine(i)} className="text-xs text-red-600">Remove</button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-right text-lg font-bold">Total: {formatCurrency(total, currency)}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Terms</label>
            <textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Saving…' : `Save ${docType === 'ESTIMATE' ? 'estimate' : 'invoice'}`}
        </button>
      </form>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
      <NewInvoiceForm />
    </Suspense>
  );
}
