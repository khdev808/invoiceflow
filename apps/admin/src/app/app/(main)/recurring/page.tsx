'use client';

import { useEffect, useState } from 'react';
import { recurringApi, type RecurringSchedule } from '@/lib/appApi';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';

export default function RecurringPage() {
  const [schedules, setSchedules] = useState<RecurringSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    recurringApi.list().then(setSchedules).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id: string, active: boolean) => {
    await recurringApi.toggle(id, active);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete recurring schedule?')) return;
    await recurringApi.delete(id);
    load();
  };

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      <PageHeader
        title="Recurring billing"
        subtitle="Automated invoices generated on schedule — set up from any new invoice"
      />

      {loading ? <p className="text-sm text-slate-500">Loading…</p> : schedules.length === 0 ? (
        <Card className="text-center">
          <p className="text-lg font-semibold">No recurring schedules yet</p>
          <p className="mt-2 text-sm text-slate-500">Create an invoice and choose Weekly, Monthly, or Quarterly under Recurring.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {schedules.map((s) => (
            <Card key={s.id} className="flex flex-wrap items-center justify-between gap-4 !p-5">
              <div>
                <p className="font-semibold capitalize">{s.frequency} schedule</p>
                <p className="text-sm text-slate-500">Next run: {formatDate(s.nextRunAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggle(s.id, !s.active)}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${s.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                >
                  {s.active ? 'Active' : 'Paused'}
                </button>
                <button type="button" onClick={() => remove(s.id)} className="if-btn-danger py-1 text-xs">Delete</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
