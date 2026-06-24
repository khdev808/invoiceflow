'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiFetch(path: string, token?: string) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('API error');
  return res.json();
}

export default function AdminDashboard() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('admin@invoiceflow.app');
  const [password, setPassword] = useState('Admin123!');
  const [dashboard, setDashboard] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setToken(data.token);
      localStorage.setItem('adminToken', data.token);
      await loadData(data.token);
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async (t: string) => {
    const [dash, userList] = await Promise.all([
      apiFetch('/admin/dashboard', t),
      apiFetch('/admin/users', t),
    ]);
    setDashboard(dash);
    setUsers(userList);
  };

  useEffect(() => {
    const saved = localStorage.getItem('adminToken');
    if (saved) {
      setToken(saved);
      loadData(saved).catch(() => localStorage.removeItem('adminToken'));
    }
  }, []);

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-slate-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
              <span className="text-white text-2xl font-bold">IF</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">InvoiceFlow Admin</h1>
            <p className="text-slate-500 mt-1">Platform management dashboard</p>
          </div>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <input className="w-full border border-slate-200 rounded-xl px-4 py-3 mb-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full border border-slate-200 rounded-xl px-4 py-3 mb-4" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={login} disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl py-3 font-semibold hover:opacity-95 disabled:opacity-50 shadow-md shadow-indigo-200">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <a href="/" className="block text-center text-sm text-slate-500 mt-4 hover:text-indigo-600">← Back to homepage</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">IF</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">InvoiceFlow Admin</h1>
            <p className="text-sm text-slate-500">Platform Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm text-slate-500 hover:text-indigo-600">Homepage</a>
          <button onClick={() => { setToken(''); localStorage.removeItem('adminToken'); }} className="text-sm text-slate-500 hover:text-red-500">
            Sign Out
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: dashboard?.userCount || 0 },
            { label: 'Total Invoices', value: dashboard?.invoiceCount || 0 },
            { label: 'Platform Revenue', value: `$${(dashboard?.totalRevenue || 0).toLocaleString()}` },
            { label: 'Plans Active', value: dashboard?.planBreakdown?.length || 0 },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Users</h2>
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-semibold text-slate-900">{u.name}</p>
                    <p className="text-sm text-slate-500">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium">{u.plan}</span>
                    <p className="text-xs text-slate-400 mt-1">{u._count?.invoices || 0} invoices</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Monthly Signups</h2>
            {dashboard?.monthlySignups?.map((m: any) => (
              <div key={m.month} className="flex items-center gap-3 py-2">
                <span className="text-sm text-slate-500 w-20">{m.month}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.min(100, m.count * 20)}%` }} />
                </div>
                <span className="text-sm font-semibold w-8">{m.count}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
