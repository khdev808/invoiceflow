'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { clientsApi, type Client } from '@/lib/appApi';
import { EmptyState } from '@/components/app/EmptyState';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    clientsApi.list(search || undefined).then(setClients).finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-slate-500">{clients.length} clients</p>
        </div>
        <Link href="/app/clients/new" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">
          + Add client
        </Link>
      </div>

      <input
        type="search"
        placeholder="Search clients…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
      />

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : clients.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Add your first client to start creating invoices."
          action={<Link href="/app/clients/new" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Add client</Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/app/clients/${c.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-200"
            >
              <p className="font-semibold">{c.name}</p>
              {c.company ? <p className="text-sm text-slate-500">{c.company}</p> : null}
              {c.email ? <p className="mt-2 text-sm text-indigo-600">{c.email}</p> : null}
              {c.phone ? <p className="text-sm text-slate-500">{c.phone}</p> : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
