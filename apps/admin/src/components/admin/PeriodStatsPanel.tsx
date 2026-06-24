'use client';

import { PeriodStats, formatMoney } from '@/lib/adminApi';

type PeriodKey = 'today' | 'month' | 'year';

const PERIOD_LABELS: Record<PeriodKey, string> = {
  today: 'Today',
  month: 'This month',
  year: 'This year',
};

type Props = {
  periods: Record<PeriodKey, PeriodStats>;
  active: PeriodKey;
  onChange: (period: PeriodKey) => void;
};

export function PeriodStatsPanel({ periods, active, onChange }: Props) {
  const stats = periods[active];

  const cards = [
    { label: 'New users', value: stats.newUsers.toLocaleString(), accent: 'text-indigo-600' },
    { label: 'Invoices created', value: stats.invoicesCreated.toLocaleString(), accent: 'text-violet-600' },
    { label: 'Invoice volume', value: formatMoney(stats.invoiceVolume), accent: 'text-slate-900' },
    { label: 'Estimates created', value: stats.estimatesCreated.toLocaleString(), accent: 'text-purple-600' },
    { label: 'Paid invoice volume', value: formatMoney(stats.paidInvoiceVolume), accent: 'text-emerald-600' },
    { label: 'Payments collected', value: formatMoney(stats.paymentsCollected), accent: 'text-teal-600' },
    { label: 'New clients', value: stats.newClients.toLocaleString(), accent: 'text-blue-600' },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Period metrics</h2>
          <p className="text-sm text-slate-500">Activity for {PERIOD_LABELS[active].toLowerCase()}</p>
        </div>
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          {(Object.keys(PERIOD_LABELS) as PeriodKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                active === key
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {PERIOD_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">{card.label}</p>
            <p className={`mt-2 text-xl font-bold tracking-tight ${card.accent}`}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
