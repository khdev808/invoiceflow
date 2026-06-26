'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DashboardData,
  adminLogin,
  clearAdminToken,
  fetchDashboard,
  formatDateTime,
  formatMoney,
  AdminApiError,
} from '@/lib/adminApi';
import { GrowthChart } from '@/components/admin/GrowthChart';
import { PeriodStatsPanel } from '@/components/admin/PeriodStatsPanel';
import { UsersTable } from '@/components/admin/UsersTable';

type PeriodKey = 'today' | 'month' | 'year';

export function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState<PeriodKey>('month');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [growthView, setGrowthView] = useState<'monthly' | 'daily'>('monthly');

  const loadDashboard = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const data = await fetchDashboard();
      setDashboard(data);
      setError('');
    } catch (e) {
      if (e instanceof AdminApiError && e.status === 401) {
        setToken(null);
      }
      setError(e instanceof AdminApiError ? e.message : 'Failed to load dashboard');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminLogin(email.trim(), password);
      setToken(data.token);
      await loadDashboard();
    } catch (e) {
      setError(e instanceof AdminApiError ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    setToken(null);
    setDashboard(null);
  };

  useEffect(() => {
    const saved = localStorage.getItem('adminToken');
    if (saved) {
      setToken(saved);
      loadDashboard().catch(() => {
        clearAdminToken();
        setToken(null);
      });
    }
  }, [loadDashboard]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-2xl font-bold text-white shadow-lg shadow-indigo-200">
              IF
            </div>
            <h1 className="text-2xl font-bold text-slate-900">InvoiceFlow Admin</h1>
            <p className="mt-1 text-slate-500">Secure platform management</p>
          </div>
          {error ? <p className="mb-4 text-center text-sm text-red-600">{error}</p> : null}
          <input
            className="mb-3 w-full rounded-xl border border-slate-200 px-4 py-3"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
          <input
            className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 font-semibold text-white shadow-md shadow-indigo-200 hover:opacity-95 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <a href="/" className="mt-4 block text-center text-sm text-slate-500 hover:text-indigo-600">
            ← Back to homepage
          </a>
        </div>
      </div>
    );
  }

  const growthData =
    growthView === 'monthly'
      ? (dashboard?.userGrowthMonthly ?? []).map((d) => ({ period: d.period, count: d.count }))
      : (dashboard?.userGrowthDaily ?? []).map((d) => ({ period: d.period, count: d.count }));

  const invoiceGrowthData =
    dashboard?.invoiceGrowthMonthly.map((d) => ({ period: d.period, count: d.count })) ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 font-bold text-white">
              IF
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">InvoiceFlow Admin</h1>
              <p className="text-sm text-slate-500">
                {dashboard ? `Updated ${formatDateTime(dashboard.generatedAt)}` : 'Loading...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <a href="/" className="text-sm text-slate-500 hover:text-indigo-600">Homepage</a>
            <button type="button" onClick={handleLogout} className="text-sm text-slate-500 hover:text-red-500">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        {dashboard ? (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: 'Total users', value: dashboard.totals.userCount.toLocaleString() },
                { label: 'Total invoices', value: dashboard.totals.invoiceCount.toLocaleString() },
                { label: 'Invoice volume', value: formatMoney(dashboard.totals.invoiceVolume) },
                { label: 'Payments collected', value: formatMoney(dashboard.totals.paymentsCollected) },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <PeriodStatsPanel periods={dashboard.periods} active={period} onChange={setPeriod} />

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-lg font-bold text-slate-900">Growth charts</h2>
              <div className="inline-flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setGrowthView('monthly')}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                    growthView === 'monthly' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  12 months
                </button>
                <button
                  type="button"
                  onClick={() => setGrowthView('daily')}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                    growthView === 'daily' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  30 days
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <GrowthChart
                title="User signups"
                subtitle={growthView === 'monthly' ? 'Last 12 months' : 'Last 30 days'}
                data={growthData}
                variant="users"
              />
              <GrowthChart
                title="Invoices created"
                subtitle="Last 12 months"
                data={invoiceGrowthData}
                variant="invoices"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-slate-900">Plan breakdown</h2>
                <div className="space-y-3">
                  {dashboard.planBreakdown.map((p) => (
                    <div key={p.plan} className="flex items-center justify-between">
                      <span className="capitalize text-slate-700">{p.plan}</span>
                      <span className="font-bold text-slate-900">{p.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                <h2 className="mb-4 text-lg font-bold text-slate-900">Invoice status</h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {dashboard.statusBreakdown.map((s) => (
                    <div key={s.status} className="rounded-lg bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.status}</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">{s.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-slate-900">Recent invoices</h2>
                <div className="space-y-3">
                  {dashboard.recentInvoices.map((inv) => (
                    <div key={inv.id} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0">
                      <div>
                        <p className="font-semibold text-slate-900">{inv.documentNumber}</p>
                        <p className="text-sm text-slate-500">{inv.client.name} · {inv.user.name}</p>
                        <p className="text-xs text-slate-400">{formatDateTime(inv.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatMoney(inv.total, inv.currency)}</p>
                        <p className="text-xs font-semibold uppercase text-indigo-600">{inv.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-slate-900">Recent payments</h2>
                <div className="space-y-3">
                  {dashboard.recentPayments.map((pay) => (
                    <div key={pay.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                      <div>
                        <p className="font-semibold text-slate-900">{pay.invoice.documentNumber}</p>
                        <p className="text-sm text-slate-500">{pay.invoice.user.name}</p>
                        <p className="text-xs text-slate-400">{formatDateTime(pay.paidAt)} · {pay.method}</p>
                      </div>
                      <p className="font-bold text-emerald-600">
                        {formatMoney(pay.amount, pay.invoice.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <UsersTable />
          </>
        ) : (
          <div className="py-20 text-center text-slate-500">Loading dashboard...</div>
        )}
      </main>
    </div>
  );
}
