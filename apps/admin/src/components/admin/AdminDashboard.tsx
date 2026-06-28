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
import { SecurityPanel } from '@/components/admin/SecurityPanel';
import { TurnstileWidget, isTurnstileEnabled } from '@/components/security/TurnstileWidget';

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
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();

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
      if (isTurnstileEnabled() && !captchaToken) {
        setError('Please complete the human verification check.');
        return;
      }
      const data = await adminLogin(email.trim(), password, captchaToken);
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
      <div className="flex min-h-screen items-center justify-center p-6" style={{ background: 'var(--if-bg)' }}>
        <div className="if-card w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <img src="/brand/logo-mark.svg" alt="" className="mx-auto mb-4 h-16 w-16" />
            <h1 className="font-display text-2xl font-semibold">InvoiceFlow Admin</h1>
            <p className="mt-1" style={{ color: 'var(--if-muted)' }}>Secure platform management</p>
          </div>
          {error ? <p className="mb-4 text-center text-sm" style={{ color: 'var(--if-danger)' }}>{error}</p> : null}
          <input
            className="if-input mb-3"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
          <input
            className="if-input mb-4"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(undefined)} />
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="if-btn-primary mt-4 w-full py-3 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <a href="/" className="mt-4 block text-center text-sm hover:underline" style={{ color: 'var(--if-muted)' }}>
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
    <div className="min-h-screen" style={{ background: 'var(--if-bg)' }}>
      <header className="sticky top-0 z-40 border-b backdrop-blur-md" style={{ borderColor: 'var(--if-border)', background: 'color-mix(in srgb, var(--if-surface) 90%, transparent)' }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="/brand/logo-mark.svg" alt="" className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-semibold">InvoiceFlow Admin</h1>
              <p className="text-sm" style={{ color: 'var(--if-muted)' }}>
                {dashboard ? `Updated ${formatDateTime(dashboard.generatedAt)}` : 'Loading...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="if-btn-secondary px-3 py-2 text-sm disabled:opacity-50"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <a href="/" className="text-sm hover:underline" style={{ color: 'var(--if-muted)' }}>Homepage</a>
            <button type="button" onClick={handleLogout} className="text-sm hover:underline" style={{ color: 'var(--if-danger)' }}>
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
                    growthView === 'monthly' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  12 months
                </button>
                <button
                  type="button"
                  onClick={() => setGrowthView('daily')}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                    growthView === 'daily' ? 'bg-white shadow-sm' : ''
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
                        <p className="text-xs font-semibold uppercase" style={{ color: 'var(--if-accent-dark)' }}>{inv.status}</p>
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
            <SecurityPanel />
          </>
        ) : (
          <div className="py-20 text-center text-slate-500">Loading dashboard...</div>
        )}
      </main>
    </div>
  );
}
