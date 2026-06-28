'use client';

import { useEffect, useState } from 'react';
import { productsApi, type Product } from '@/lib/appApi';
import { formatCurrency } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/app/EmptyState';

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
    <div className="mx-auto max-w-6xl animate-fade-in">
      <PageHeader
        title="Products & services"
        subtitle="Save items you invoice often for faster line-item entry."
      />

      <Card className="mb-6">
        <form onSubmit={add} className="grid gap-3 md:grid-cols-6">
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="if-input md:col-span-2" />
          <input type="number" step="0.01" required placeholder="Price" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} className="if-input" />
          <input type="number" step="0.01" placeholder="Tax %" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: e.target.value })} className="if-input" />
          <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="if-input" />
          <button type="submit" className="if-btn-primary">Add</button>
        </form>
      </Card>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--if-muted)' }}>Loading…</p>
      ) : products.length === 0 ? (
        <EmptyState
          illustration="/illustrations/empty-invoices.svg"
          title="No products yet"
          description="Add your first product or service to speed up invoice line-item entry."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id} className="!p-5">
              <p className="font-semibold">{p.name}</p>
              {p.description ? <p className="mt-1 text-sm" style={{ color: 'var(--if-muted)' }}>{p.description}</p> : null}
              <p className="mt-3 text-lg font-bold" style={{ color: 'var(--if-accent-dark)' }}>{formatCurrency(p.unitPrice)}</p>
              <button type="button" onClick={() => remove(p.id)} className="if-btn-danger mt-3 py-1 text-xs">Delete</button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
