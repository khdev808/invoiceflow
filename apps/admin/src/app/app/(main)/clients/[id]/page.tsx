'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clientsApi, type Client } from '@/lib/appApi';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientsApi.get(id).then(setClient).finally(() => setLoading(false));
  }, [id]);

  const remove = async () => {
    if (!confirm('Delete this client?')) return;
    await clientsApi.delete(id);
    router.push('/app/clients');
  };

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (!client) return <p className="text-sm text-red-600">Client not found</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/app/clients" className="text-sm text-indigo-600 hover:underline">← Clients</Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{client.name}</h1>
          {client.company ? <p className="text-slate-500">{client.company}</p> : null}
        </div>
        <Link href={`/app/invoices/new?clientId=${client.id}`} className="if-btn-primary">
          + New invoice
        </Link>
        <Link href={`/app/clients/${client.id}/edit`} className="if-btn-secondary">
          Edit client
        </Link>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 text-sm">
        {client.email ? <p><span className="text-slate-500">Email:</span> {client.email}</p> : null}
        {client.phone ? <p><span className="text-slate-500">Phone:</span> {client.phone}</p> : null}
        {client.address ? (
          <p>
            <span className="text-slate-500">Address:</span>{' '}
            {[client.address, client.city, client.state, client.zip].filter(Boolean).join(', ')}
          </p>
        ) : null}
        {client._count ? <p><span className="text-slate-500">Invoices:</span> {client._count.invoices}</p> : null}
      </div>
      <button type="button" onClick={remove} className="text-sm font-medium text-red-600 hover:underline">
        Delete client
      </button>
    </div>
  );
}
