'use client';

import { useEffect, useState } from 'react';
import { notificationsApi, type Notification } from '@/lib/appApi';
import { formatDateTime } from '@/lib/format';

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.list().then(setItems).finally(() => setLoading(false));
    notificationsApi.markAllRead().catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-slate-500">Payment alerts, overdue reminders, and client activity</p>
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading…</p> : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          No notifications yet.
        </p>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {items.map((n) => (
            <div key={n.id} className={`px-6 py-4 ${!n.read ? 'bg-indigo-50/50' : ''}`}>
              <p className="font-medium">{n.title}</p>
              <p className="mt-1 text-sm text-slate-600">{n.body}</p>
              <p className="mt-2 text-xs text-slate-400">{formatDateTime(n.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
