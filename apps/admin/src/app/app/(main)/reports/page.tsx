'use client';

import { useEffect, useState } from 'react';
import { reportsApi, type IncomeReport, type ProfitLossReport } from '@/lib/appApi';
import { formatCurrency } from '@/lib/format';

export default function ReportsPage() {
  const [income, setIncome] = useState<IncomeReport | null>(null);
  const [pl, setPl] = useState<ProfitLossReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
    const to = new Date().toISOString().slice(0, 10);
    Promise.all([reportsApi.income(from, to), reportsApi.profitLoss(from, to)])
      .then(([inc, profit]) => { setIncome(inc); setPl(profit); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-slate-500">Year-to-date income and profit & loss</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Income</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{formatCurrency(income?.total || 0)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Expenses</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{formatCurrency(pl?.expenses || 0)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Profit</p>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{formatCurrency(pl?.profit || 0)}</p>
        </div>
      </div>

      {income?.byMonth && Object.keys(income.byMonth).length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Income by month</h2>
          <div className="space-y-2">
            {Object.entries(income.byMonth).map(([month, amount]) => (
              <div key={month} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{month}</span>
                <span className="font-semibold">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
