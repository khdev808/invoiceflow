'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { clientsApi } from '@/lib/appApi';
import { useAuth } from '@/contexts/AuthContext';
import { getCountryCompliance } from '@/lib/countryCompliance';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';

export default function NewClientPage() {
  const router = useRouter();
  const { user } = useAuth();
  const clientTaxLabel = getCountryCompliance((user?.settings as { invoiceCountry?: string } | undefined)?.invoiceCountry).clientTaxIdLabel;
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
    <div className="mx-auto max-w-xl animate-fade-in">
      <PageHeader
        title="Add client"
        subtitle="Create a new client for invoicing"
        backHref="/app/clients"
      />

      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          {error ? (
            <p className="text-sm" style={{ color: 'var(--if-danger)' }}>{error}</p>
          ) : null}
          {(['name', 'company', 'email', 'phone', 'address', 'city', 'state', 'zip'] as const).map((field) => (
            <div key={field}>
              <label className="if-label capitalize">{field}</label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                required={field === 'name'}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="if-input"
              />
            </div>
          ))}
          <div>
            <label className="if-label">{clientTaxLabel}</label>
            <input
              type="text"
              value={form.vatId}
              onChange={(e) => setForm({ ...form, vatId: e.target.value })}
              placeholder={clientTaxLabel}
              className="if-input"
            />
          </div>
          <button type="submit" disabled={loading} className="if-btn-primary">
            {loading ? 'Saving…' : 'Save client'}
          </button>
        </form>
      </Card>
    </div>
  );
}
