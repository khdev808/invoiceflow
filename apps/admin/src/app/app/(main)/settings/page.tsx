'use client';

import { useEffect, useState } from 'react';
import { planApi, usersApi } from '@/lib/appApi';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const [usage, setUsage] = useState<{ invoicesUsed: number; invoiceLimit: number; plan: string } | null>(null);
  const [form, setForm] = useState({ name: '', businessName: '', businessEmail: '', businessPhone: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        businessName: user.businessName || '',
        businessEmail: (user as { businessEmail?: string }).businessEmail || '',
        businessPhone: (user as { businessPhone?: string }).businessPhone || '',
      });
    }
    planApi.usage().then(setUsage).catch(() => {});
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await usersApi.updateProfile(form);
      await refresh();
      setMessage('Profile saved.');
    } catch {
      setMessage('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-500">Business profile and plan usage</p>
      </div>

      {usage ? (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6">
          <p className="text-sm font-semibold uppercase text-indigo-700">Plan: {usage.plan}</p>
          <p className="mt-2 text-2xl font-bold">
            {usage.invoicesUsed} / {usage.invoiceLimit < 0 ? '∞' : usage.invoiceLimit} invoices this month
          </p>
        </div>
      ) : null}

      <form onSubmit={save} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        {(['name', 'businessName', 'businessEmail', 'businessPhone'] as const).map((field) => (
          <div key={field}>
            <label className="mb-1 block text-sm font-medium capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
            <input
              type={field.includes('Email') ? 'email' : 'text'}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>
        ))}
        <p className="text-sm text-slate-500">Email: {user?.email}</p>
        <button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}
