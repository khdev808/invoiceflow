'use client';

import { useEffect, useState } from 'react';
import { productsApi, type Product } from '@/lib/appApi';
import { formatCurrency } from '@/lib/format';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: '', description: '', unitPrice: '', taxRate: '0', sku: '' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    productsApi.list().then(setProducts).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    await productsApi.create({
      name: form.name,
      description: form.description || undefined,
      unitPrice: Number(form.unitPrice),
      taxRate: Number(form.taxRate),
      sku: form.sku || undefined,
    });
    setForm({ name: '', description: '', unitPrice: '', taxRate: '0', sku: '' });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete product?')) return;
    await productsApi.delete(id);
    load();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Products & services</h1>
        <p className="text-slate-500">Save items you invoice often for faster line-item entry.</p>
      </div>

      <form onSubmit={add} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-6">
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm md:col-span-2" />
        <input type="number" step="0.01" required placeholder="Price" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        <input type="number" step="0.01" placeholder="Tax %" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Add</button>
      </form>

      {loading ? <p className="text-sm text-slate-500">Loading…</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="font-semibold">{p.name}</p>
              {p.description ? <p className="mt-1 text-sm text-slate-500">{p.description}</p> : null}
              <p className="mt-3 text-lg font-bold text-indigo-600">{formatCurrency(p.unitPrice)}</p>
              <button type="button" onClick={() => remove(p.id)} className="mt-3 text-xs text-red-600">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
