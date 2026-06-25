'use client';

import { useEffect, useState } from 'react';
import { expensesApi, type Expense } from '@/lib/appApi';
import { formatCurrency, formatDate } from '@/lib/format';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState({ total: 0, count: 0 });
  const [form, setForm] = useState({ description: '', amount: '', category: 'General', vendor: '' });
  const [loading, setLoading] = useState(true);

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

  const remove = async (id: string) => {
    if (!confirm('Delete expense?')) return;
    await expensesApi.delete(id);
    load();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Expenses</h1>
        <p className="text-slate-500">{summary.count} expenses · {formatCurrency(summary.total)} total</p>
      </div>

      <form onSubmit={add} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-5">
        <input required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm md:col-span-2" />
        <input required type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Add</button>
      </form>

      {loading ? <p className="text-sm text-slate-500">Loading…</p> : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 text-slate-500">{formatDate(e.date)}</td>
                  <td className="px-4 py-3 font-medium">{e.description}</td>
                  <td className="px-4 py-3">{e.category}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(e.amount)}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => remove(e.id)} className="text-xs text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
