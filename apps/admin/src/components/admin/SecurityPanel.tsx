'use client';

import { useEffect, useState } from 'react';
import {
  SecurityBlock,
  SecurityEvent,
  createSecurityBlock,
  fetchSecurityBlocks,
  fetchSecurityEvents,
  formatDateTime,
  removeSecurityBlock,
  AdminApiError,
} from '@/lib/adminApi';

export function SecurityPanel() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [blocks, setBlocks] = useState<SecurityBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    blockType: 'ip' as 'ip' | 'email',
    value: '',
    scope: 'temporary' as 'temporary' | 'permanent',
    reason: '',
    hours: '24',
  });

  const load = async () => {
    setLoading(true);
    try {
      const [ev, bl] = await Promise.all([fetchSecurityEvents(40), fetchSecurityBlocks()]);
      setEvents(ev);
      setBlocks(bl);
      setError('');
    } catch (e) {
      setError(e instanceof AdminApiError ? e.message : 'Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.value.trim()) return;
    try {
      await createSecurityBlock({
        blockType: form.blockType,
        value: form.value.trim(),
        scope: form.scope,
        reason: form.reason || undefined,
        hours: form.scope === 'temporary' ? Number(form.hours) : undefined,
      });
      setForm((f) => ({ ...f, value: '', reason: '' }));
      await load();
    } catch (err) {
      alert(err instanceof AdminApiError ? err.message : 'Failed to create block');
    }
  };

  const removeBlock = async (id: string) => {
    if (!confirm('Remove this block?')) return;
    await removeSecurityBlock(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Block IP or email</h2>
        <p className="mt-1 text-sm text-slate-500">Temporary or permanent blocks for bots and abusive sign-in attempts.</p>
        <form onSubmit={addBlock} className="mt-4 grid gap-3 md:grid-cols-6">
          <select value={form.blockType} onChange={(e) => setForm({ ...form, blockType: e.target.value as 'ip' | 'email' })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="ip">IP address</option>
            <option value="email">Email</option>
          </select>
          <input required placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm md:col-span-2" />
          <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value as 'temporary' | 'permanent' })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="temporary">Temporary</option>
            <option value="permanent">Permanent</option>
          </select>
          {form.scope === 'temporary' ? (
            <input type="number" min={1} max={720} value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Hours" />
          ) : (
            <input placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          )}
          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Block</button>
        </form>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-900">Active blocks</h3>
          {loading ? <p className="mt-4 text-sm text-slate-500">Loading…</p> : (
            <ul className="mt-4 space-y-2 text-sm">
              {blocks.length === 0 ? <li className="text-slate-500">No active blocks.</li> : blocks.map((b) => (
                <li key={b.id} className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  <div>
                    <p className="font-semibold">{b.blockType.toUpperCase()}: {b.value}</p>
                    <p className="text-xs text-slate-500">{b.scope}{b.expiresAt ? ` · until ${formatDateTime(b.expiresAt)}` : ''}</p>
                    {b.reason ? <p className="text-xs text-slate-500">{b.reason}</p> : null}
                  </div>
                  <button type="button" onClick={() => removeBlock(b.id)} className="text-xs font-semibold text-red-600">Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-900">Recent security events</h3>
          {loading ? <p className="mt-4 text-sm text-slate-500">Loading…</p> : (
            <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto text-sm">
              {events.map((ev) => (
                <li key={ev.id} className="rounded-lg border border-slate-100 px-3 py-2">
                  <p className="font-semibold text-slate-800">{ev.eventType}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(ev.createdAt)}{ev.email ? ` · ${ev.email}` : ''}{ev.ipAddress ? ` · ${ev.ipAddress}` : ''}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
