'use client';

import { useEffect, useState } from 'react';
import { clientsApi, timeApi, type Client, type TimeEntry } from '@/lib/appApi';
import { formatCurrency, formatDate } from '@/lib/format';

export default function TimePage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({ clientId: '', description: '', hours: '1', rate: '75' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([timeApi.list(), clientsApi.list()]).then(([t, c]) => {
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

  const remove = async (id: string) => {
    if (!confirm('Delete entry?')) return;
    await timeApi.delete(id);
    load();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Time tracking</h1>
        <p className="text-slate-500">Log billable hours and add them to invoices from mobile or web.</p>
      </div>

      <form onSubmit={add} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-5">
        <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="">No client</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm md:col-span-2" />
        <input required type="number" step="0.25" placeholder="Hours" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        <input required type="number" step="0.01" placeholder="Rate/hr" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white md:col-span-5 md:w-auto">Log time</button>
      </form>

      {loading ? <p className="text-sm text-slate-500">Loading…</p> : (
        <div className="space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <div>
                <p className="font-medium">{e.description}</p>
                <p className="text-sm text-slate-500">
                  {e.client?.name || 'No client'} · {formatDate(e.date)} · {e.hours}h @ {formatCurrency(e.rate)}/hr
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{formatCurrency(e.hours * e.rate)}</span>
                {e.invoiced ? <span className="text-xs text-emerald-600">Invoiced</span> : null}
                <button type="button" onClick={() => remove(e.id)} className="text-xs text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
