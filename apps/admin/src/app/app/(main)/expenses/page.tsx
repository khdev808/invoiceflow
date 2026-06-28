'use client';

import { useEffect, useRef, useState } from 'react';
import { expensesApi, ocrApi, type Expense } from '@/lib/appApi';
import { formatCurrency, formatDate } from '@/lib/format';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/app/EmptyState';

export default function ExpensesPage() {
  const { user } = useAuth();
  const isPro = user?.plan === 'pro' || user?.plan === 'business';
  const fileRef = useRef<HTMLInputElement>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState({ total: 0, count: 0 });
  const [form, setForm] = useState({ description: '', amount: '', category: 'General', vendor: '' });
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');

  const load = () => {
    Promise.all([expensesApi.list(), expensesApi.summary()]).then(([list, sum]) => {
      setExpenses(list);
      setSummary(sum);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    await expensesApi.create({
      description: form.description,
      amount: Number(form.amount),
      category: form.category,
      vendor: form.vendor || undefined,
    });
    setForm({ description: '', amount: '', category: 'General', vendor: '' });
    load();
  };

  const scanReceipt = async (file: File) => {
    if (!isPro) {
      setScanError('Receipt OCR requires Pro. Upgrade in Settings → Plan.');
      return;
    }
    setScanning(true);
    setScanError('');
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await ocrApi.parseReceipt(base64, file.type);
      setForm({
        description: result.description,
        amount: result.amount > 0 ? String(result.amount) : '',
        category: result.category || 'General',
        vendor: result.vendor || '',
      });
      if (result.requiresManualAmount) {
        setScanError('Amount not detected — please confirm the total before saving.');
      }
    } catch (err: unknown) {
      setScanError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete expense?')) return;
    await expensesApi.delete(id);
    load();
  };

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <PageHeader
        title="Expenses"
        subtitle={`${summary.count} expenses · ${formatCurrency(summary.total)} total`}
        actions={
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) scanReceipt(file);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={scanning}
              className="if-btn-secondary"
            >
              {scanning ? 'Scanning…' : '📷 Scan receipt (Pro)'}
            </button>
          </>
        }
      />

      {scanError ? (
        <p className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--if-warning-soft)', color: 'var(--if-warning)' }}>{scanError}</p>
      ) : null}

      <Card className="mb-6">
        <form onSubmit={add} className="grid gap-3 md:grid-cols-6">
          <input required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="if-input md:col-span-2" />
          <input required type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="if-input" />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="if-input" />
          <input placeholder="Vendor" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} className="if-input" />
          <button type="submit" className="if-btn-primary">Add</button>
        </form>
      </Card>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--if-muted)' }}>Loading…</p>
      ) : expenses.length === 0 ? (
        <EmptyState
          illustration="/illustrations/empty-expenses.svg"
          title="No expenses yet"
          description="Track business expenses manually or scan receipts with Pro."
        />
      ) : (
        <Card padding={false} className="overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="text-left" style={{ background: 'var(--if-bg)', color: 'var(--if-muted)' }}>
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--if-border)' }}>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3" style={{ color: 'var(--if-muted)' }}>{formatDate(e.date)}</td>
                  <td className="px-4 py-3 font-medium">{e.description}</td>
                  <td className="px-4 py-3">{e.category}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatCurrency(e.amount)}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => remove(e.id)} className="if-btn-danger py-1 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
