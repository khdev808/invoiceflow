'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { clientsApi } from '@/lib/appApi';

export default function NewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', address: '', city: '', state: '', zip: '', vatId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const client = await clientsApi.create(form);
      router.push(`/app/clients/${client.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href="/app/clients" className="text-sm text-indigo-600 hover:underline">← Clients</Link>
      <h1 className="text-3xl font-bold">Add client</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {(['name', 'company', 'email', 'phone', 'vatId', 'address', 'city', 'state', 'zip'] as const).map((field) => (
          <div key={field}>
            <label className="mb-1 block text-sm font-medium capitalize">{field === 'vatId' ? 'VAT ID' : field}</label>
            <input
              type={field === 'email' ? 'email' : 'text'}
              required={field === 'name'}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>
        ))}
        <button type="submit" disabled={loading} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">
          {loading ? 'Saving…' : 'Save client'}
        </button>
      </form>
    </div>
  );
}
