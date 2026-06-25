'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { mileageApi, type MileageEntry } from '@/lib/appApi';
import { formatCurrency, formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';

export default function MileagePage() {
  const [entries, setEntries] = useState<MileageEntry[]>([]);
  const [summary, setSummary] = useState({ totalMiles: 0, totalAmount: 0, unbilledMiles: 0 });
  const [form, setForm] = useState({ description: '', miles: '', purpose: 'Business' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([mileageApi.list(), mileageApi.summary()])
      .then(([list, sum]) => { setEntries(list); setSummary(sum); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    await mileageApi.create({
      description: form.description,
      miles: Number(form.miles),
      purpose: form.purpose,
    });
    setForm({ description: '', miles: '', purpose: 'Business' });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete mileage entry?')) return;
    await mileageApi.delete(id);
    load();
  };

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <PageHeader
        title="Mileage tracking"
        subtitle="IRS-rate mileage logs — bill clients or track deductions"
        actions={
          <Link href="/app/invoices/new" className="if-btn-primary">+ New invoice</Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total miles', value: summary.totalMiles.toFixed(1) },
          { label: 'Total value', value: formatCurrency(summary.totalAmount) },
          { label: 'Unbilled miles', value: summary.unbilledMiles.toFixed(1) },
        ].map((s) => (
          <div key={s.label} className="if-stat-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.label}</p>
            <p className="mt-2 text-2xl font-bold text-indigo-600">{s.value}</p>
          </div>
        ))}
      </div>

      <Card className="mb-6">
        <form onSubmit={add} className="grid gap-3 md:grid-cols-4">
          <input required placeholder="Trip description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="if-input md:col-span-2" />
          <input required type="number" step="0.1" placeholder="Miles" value={form.miles} onChange={(e) => setForm({ ...form, miles: e.target.value })} className="if-input" />
          <button type="submit" className="if-btn-primary">Log trip</button>
        </form>
      </Card>

      {loading ? <p className="text-sm text-slate-500">Loading…</p> : (
        <div className="space-y-3">
          {entries.map((e) => (
            <Card key={e.id} className="flex flex-wrap items-center justify-between gap-3 !p-4">
              <div>
                <p className="font-semibold">{e.description}</p>
                <p className="text-sm text-slate-500">{formatDate(e.date)} · {e.miles} mi @ {formatCurrency(e.rate)}/mi</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold">{formatCurrency(e.amount)}</span>
                {e.billed ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Billed</span> : null}
                <button type="button" onClick={() => remove(e.id)} className="text-xs font-medium text-red-600">Delete</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
