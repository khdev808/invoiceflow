'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clientsApi, timeApi, type Client, type TimeEntry } from '@/lib/appApi';
import { formatCurrency, formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';

export default function TimePage() {
  const router = useRouter();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ clientId: '', description: '', hours: '1', rate: '75' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([timeApi.list(true), clientsApi.list()]).then(([t, c]) => {
      setEntries(t);
      setClients(c);
      if (c.length && !form.clientId) setForm((f) => ({ ...f, clientId: c[0].id }));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    await timeApi.create({
      clientId: form.clientId || undefined,
      description: form.description,
      hours: Number(form.hours),
      rate: Number(form.rate),
    });
    setForm((f) => ({ ...f, description: '', hours: '1' }));
    load();
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const billToInvoice = async () => {
    if (selected.size === 0) return;
    const lineItems = await timeApi.toLineItems([...selected]);
    sessionStorage.setItem('prefilledLineItems', JSON.stringify(lineItems));
    router.push('/app/invoices/new');
  };

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <PageHeader
        title="Time tracking"
        subtitle="Log billable hours and add them to invoices"
        actions={
          <div className="flex gap-2">
            {selected.size > 0 ? (
              <button type="button" onClick={billToInvoice} className="if-btn-primary">
                Bill {selected.size} entries to invoice
              </button>
            ) : null}
            <button type="button" onClick={() => timeApi.exportIcs()} className="if-btn-secondary">
              Export to calendar (.ics)
            </button>
          </div>
        }
      />

      <Card className="mb-6">
        <form onSubmit={add} className="grid gap-3 md:grid-cols-5">
          <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="if-input">
            <option value="">No client</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="if-input md:col-span-2" />
          <input required type="number" step="0.25" placeholder="Hours" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} className="if-input" />
          <input required type="number" step="0.01" placeholder="Rate/hr" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} className="if-input" />
          <button type="submit" className="if-btn-primary md:col-span-5 md:w-auto">Log time</button>
        </form>
      </Card>

      {loading ? <p className="text-sm text-slate-500">Loading…</p> : (
        <div className="space-y-3">
          {entries.map((e) => (
            <Card key={e.id} className="flex flex-wrap items-center justify-between gap-3 !p-4">
              <label className="flex flex-1 cursor-pointer items-center gap-3">
                {!e.invoiced ? (
                  <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggle(e.id)} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
                ) : null}
                <div>
                  <p className="font-semibold">{e.description}</p>
                  <p className="text-sm text-slate-500">{e.client?.name || 'No client'} · {formatDate(e.date)} · {e.hours}h @ {formatCurrency(e.rate)}/hr</p>
                </div>
              </label>
              <div className="flex items-center gap-3">
                <span className="font-bold">{formatCurrency(e.hours * e.rate)}</span>
                {e.invoiced ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Invoiced</span> : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

