'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { clientsApi, type Client } from '@/lib/appApi';
import { EmptyState } from '@/components/app/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { useAppLocale } from '@/lib/i18n/AppLocaleContext';

export default function ClientsPage() {
  const { t } = useAppLocale();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    clientsApi.list(search || undefined).then(setClients).finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <PageHeader
        title={t('clientsTitle')}
        subtitle={`${clients.length} ${t('clientsCount')}`}
        actions={
          <Link href="/app/clients/new" className="if-btn-primary">
            + {t('addClient')}
          </Link>
        }
      />

      <input
        type="search"
        placeholder={t('searchClients')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="if-input mb-6 max-w-md"
      />

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--if-muted)' }}>{t('loading')}</p>
      ) : clients.length === 0 ? (
        <EmptyState
          illustration="/illustrations/empty-clients.svg"
          title={t('noClients')}
          description={t('noClientsHint')}
          action={<Link href="/app/clients/new" className="if-btn-primary">{t('addClient')}</Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <Link key={c.id} href={`/app/clients/${c.id}`}>
              <Card className="!p-5 transition hover:ring-2">
                <p className="font-semibold" style={{ color: 'var(--if-text)' }}>{c.name}</p>
                {c.company ? <p className="text-sm" style={{ color: 'var(--if-muted)' }}>{c.company}</p> : null}
                {c.email ? <p className="mt-2 text-sm" style={{ color: 'var(--if-accent-dark)' }}>{c.email}</p> : null}
                {c.phone ? <p className="text-sm" style={{ color: 'var(--if-muted)' }}>{c.phone}</p> : null}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
