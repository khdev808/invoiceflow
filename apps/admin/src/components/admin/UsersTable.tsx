'use client';

import { useEffect, useState } from 'react';
import {
  AdminUser,
  UsersPage,
  fetchUsers,
  updateUserPlan,
  formatDate,
  AdminApiError,
} from '@/lib/adminApi';

const PLANS = ['free', 'pro', 'business'] as const;

export function UsersTable() {
  const [data, setData] = useState<UsersPage | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async (p = page, q = search) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchUsers(p, q);
      setData(result);
    } catch (e) {
      setError(e instanceof AdminApiError ? e.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => load(page, search), search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [page, search]);

  const handlePlanChange = async (user: AdminUser, plan: string) => {
    if (user.plan === plan || user.role === 'ADMIN') return;
    setUpdatingId(user.id);
    try {
      await updateUserPlan(user.id, plan);
      await load(page, search);
    } catch (e) {
      alert(e instanceof AdminApiError ? e.message : 'Failed to update plan');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Users</h2>
          <p className="text-sm text-slate-500">{data?.total ?? 0} registered accounts</p>
        </div>
        <input
          type="search"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm sm:max-w-xs"
        />
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="pb-3 pr-4 font-semibold">User</th>
              <th className="pb-3 pr-4 font-semibold">Plan</th>
              <th className="pb-3 pr-4 font-semibold">Invoices</th>
              <th className="pb-3 pr-4 font-semibold">Clients</th>
              <th className="pb-3 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading && !data ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">Loading users...</td>
              </tr>
            ) : (
              data?.items.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-slate-500">{user.email}</p>
                    {user.businessName ? (
                      <p className="text-xs text-slate-400">{user.businessName}</p>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4">
                    {user.role === 'ADMIN' ? (
                      <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">ADMIN</span>
                    ) : (
                      <select
                        value={user.plan}
                        disabled={updatingId === user.id}
                        onChange={(e) => handlePlanChange(user, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold capitalize"
                      >
                        {PLANS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="py-3 pr-4 font-medium">{user._count.invoices}</td>
                  <td className="py-3 pr-4 font-medium">{user._count.clients}</td>
                  <td className="py-3 text-slate-500">{formatDate(user.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.pages > 1 ? (
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">Page {data.page} of {data.pages}</span>
          <button
            type="button"
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
