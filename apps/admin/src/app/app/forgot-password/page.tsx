'use client';

import Link from 'next/link';
import { useState } from 'react';
import { authApi, AppApiError } from '@/lib/appApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setMessage(res.message);
    } catch (err) {
      setError(err instanceof AppApiError ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC] px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-500">We will email you a link to choose a new password.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {message ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/app/login" className="font-semibold text-indigo-600 hover:underline">← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
