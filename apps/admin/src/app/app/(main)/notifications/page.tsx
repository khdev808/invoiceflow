'use client';

import { useEffect, useState } from 'react';
import { notificationsApi, type Notification } from '@/lib/appApi';
import { formatDateTime } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/app/EmptyState';

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.list().then(setItems).finally(() => setLoading(false));
    notificationsApi.markAllRead().catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <PageHeader
        title="Notifications"
        subtitle="Payment alerts, overdue reminders, and client activity"
      />

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--if-muted)' }}>Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState
          illustration="/illustrations/success-invoice.svg"
          title="No notifications yet"
          description="When clients pay invoices or documents become overdue, alerts will appear here."
        />
      ) : (
        <Card padding={false} className="overflow-hidden">
          <div className="divide-y" style={{ borderColor: 'var(--if-border)' }}>
            {items.map((n) => (
              <div key={n.id} className="px-6 py-4" style={{ background: !n.read ? 'var(--if-accent-soft)' : undefined }}>
                <p className="font-medium">{n.title}</p>
                <p className="mt-1 text-sm" style={{ color: 'var(--if-muted)' }}>{n.body}</p>
                <p className="mt-2 text-xs" style={{ color: 'var(--if-muted)' }}>{formatDateTime(n.createdAt)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
