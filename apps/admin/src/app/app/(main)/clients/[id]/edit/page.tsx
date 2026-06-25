'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clientsApi, type Client } from '@/lib/appApi';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';

export default function EditClientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', address: '', city: '', state: '', zip: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    clientsApi.get(id).then((c: Client) => {
      setForm({
        name: c.name || '',
        email: c.email || '',
        phone: c.phone || '',
        company: c.company || '',
        address: c.address || '',
        city: c.city || '',
        state: c.state || '',
        zip: c.zip || '',
        notes: c.notes || '',
      });
    }).finally(() => setLoading(false));
  }, [id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await clientsApi.update(id, form);
    router.push(`/app/clients/${id}`);
  };

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <PageHeader title="Edit client" backHref={`/app/clients/${id}`} />
      <Card>
        <form onSubmit={save} className="space-y-4">
          {(['name', 'company', 'email', 'phone', 'address', 'city', 'state', 'zip'] as const).map((field) => (
            <div key={field}>
              <label className="if-label capitalize">{field}</label>
              <input required={field === 'name'} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="if-input" />
            </div>
          ))}
          <div>
            <label className="if-label">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="if-input" />
          </div>
          <button type="submit" disabled={saving} className="if-btn-primary">{saving ? 'Saving…' : 'Save changes'}</button>
        </form>
      </Card>
    </div>
  );
}
