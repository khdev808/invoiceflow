'use client';

import { useEffect, useState } from 'react';
import { reportsApi, type IncomeReport, type ProfitLossReport } from '@/lib/appApi';
import { formatCurrency } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';

export default function ReportsPage() {
  const [from, setFrom] = useState(() => new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [income, setIncome] = useState<IncomeReport | null>(null);
  const [pl, setPl] = useState<ProfitLossReport | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([reportsApi.income(from, to), reportsApi.profitLoss(from, to)])
      .then(([inc, profit]) => { setIncome(inc); setPl(profit); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [from, to]);

  const exportCsv = () => {
    if (!income?.byMonth) return;
    const rows = [['Month', 'Income'], ...Object.entries(income.byMonth).map(([m, a]) => [m, String(a)])];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `income-${from}-${to}.csv`;
    a.click();
  };

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <PageHeader
        title="Reports"
        subtitle="Income and profit & loss for your date range"
        actions={<button type="button" onClick={exportCsv} className="if-btn-secondary">Export CSV</button>}
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="if-label">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="if-input" />
          </div>
          <div>
            <label className="if-label">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="if-input" />
          </div>
        </div>
      </Card>

      {loading ? <p className="text-sm text-slate-500">Loading…</p> : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Income', value: formatCurrency(income?.total || 0), color: 'text-emerald-600' },
              { label: 'Expenses', value: formatCurrency(pl?.expenses || 0), color: 'text-red-600' },
              { label: 'Profit', value: formatCurrency(pl?.profit || 0), color: 'text-indigo-600' },
            ].map((s) => (
              <div key={s.label} className="if-stat-card">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{s.label}</p>
                <p className={`mt-2 text-3xl font-extrabold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {income?.byMonth && Object.keys(income.byMonth).length > 0 ? (
            <Card>
              <h2 className="mb-4 font-bold">Income by month</h2>
              <div className="space-y-2">
                {Object.entries(income.byMonth).map(([month, amount]) => (
                  <div key={month} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2 text-sm">
                    <span className="font-medium text-slate-600">{month}</span>
                    <span className="font-bold">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
