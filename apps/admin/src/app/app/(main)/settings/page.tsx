'use client';

import { useEffect, useState } from 'react';
import { integrationsApi, planApi, referralsApi, uploadsApi, usersApi } from '@/lib/appApi';
import { templates } from '@/lib/constants';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';

const TABS = ['Profile', 'Business', 'Invoicing', 'Integrations', 'Referrals', 'Plan'] as const;

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Profile');
  const [usage, setUsage] = useState<{
    used: number;
    limit: number;
    plan: string;
    stripeConfigured?: boolean;
  } | null>(null);
  const [profile, setProfile] = useState({ name: '', businessName: '', businessEmail: '', businessPhone: '', businessAddress: '', taxId: '' });
  const [settings, setSettings] = useState({
    defaultTaxRate: '0',
    defaultPaymentTerms: '30',
    templateId: 'modern',
    enablePaymentReminders: true,
    enableLateFees: false,
    reminderDaysBefore: '3',
    reminderDaysAfter: '7',
    lateFeePercent: '0',
    webhookUrl: '',
    invoiceCountry: 'US',
    legalFooter: '',
  });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [referral, setReferral] = useState<{
    referralCode: string;
    referralCount: number;
    upgradedReferrals: number;
    reward: string;
  } | null>(null);

  useEffect(() => {
    referralsApi.me().then(setReferral).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        businessName: user.businessName || '',
        businessEmail: (user as { businessEmail?: string }).businessEmail || '',
        businessPhone: (user as { businessPhone?: string }).businessPhone || '',
        businessAddress: (user as { businessAddress?: string }).businessAddress || '',
        taxId: (user as { taxId?: string }).taxId || '',
      });
      const s = user.settings as Record<string, unknown> | undefined;
      if (s) {
        setSettings((prev) => ({
          ...prev,
          defaultTaxRate: String(s.defaultTaxRate ?? 0),
          defaultPaymentTerms: String(s.defaultPaymentTerms ?? 30),
          templateId: String(s.templateId ?? 'modern'),
          enablePaymentReminders: s.enablePaymentReminders !== false,
          enableLateFees: Boolean(s.enableLateFees),
          reminderDaysBefore: String(s.reminderDaysBefore ?? 3),
          reminderDaysAfter: String(s.reminderDaysAfter ?? 7),
          lateFeePercent: String(s.lateFeePercent ?? 0),
          webhookUrl: String(s.webhookUrl ?? ''),
          invoiceCountry: String(s.invoiceCountry ?? 'US'),
          legalFooter: String(s.legalFooter ?? ''),
        }));
      }
    }
    planApi.usage().then(setUsage).catch(() => {});
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgraded')) {
      setMessage(`Welcome to ${params.get('upgraded')}! Your plan is now active.`);
      planApi.usage().then(setUsage);
      refresh();
      window.history.replaceState({}, '', '/app/settings');
    }
  }, [refresh]);

  const saveProfile = async () => {
    setSaving(true);
    setMessage('');
    try {
      await usersApi.updateProfile(profile);
      await refresh();
      setMessage('Profile saved.');
    } catch { setMessage('Failed to save profile.'); }
    finally { setSaving(false); }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');
    try {
      await usersApi.updateSettings({
        defaultTaxRate: Number(settings.defaultTaxRate),
        defaultPaymentTerms: Number(settings.defaultPaymentTerms),
        templateId: settings.templateId,
        enablePaymentReminders: settings.enablePaymentReminders,
        enableLateFees: settings.enableLateFees,
        reminderDaysBefore: Number(settings.reminderDaysBefore),
        reminderDaysAfter: Number(settings.reminderDaysAfter),
        lateFeePercent: Number(settings.lateFeePercent),
        invoiceCountry: settings.invoiceCountry,
        legalFooter: settings.legalFooter || undefined,
      });
      await refresh();
      setMessage('Settings saved.');
    } catch { setMessage('Failed to save settings.'); }
    finally { setSaving(false); }
  };

  const saveWebhook = async () => {
    setSaving(true);
    try {
      await integrationsApi.setWebhook(settings.webhookUrl);
      setMessage('Webhook URL saved.');
    } catch { setMessage('Failed to save webhook.'); }
    finally { setSaving(false); }
  };

  const testWebhook = async () => {
    try {
      await integrationsApi.test();
      setMessage('Test event sent to your webhook.');
    } catch { setMessage('Webhook test failed.'); }
  };

  const upgrade = async (plan: 'pro' | 'business') => {
    try {
      const res = await planApi.upgrade(plan);
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      await refresh();
      planApi.usage().then(setUsage);
      setMessage(res.message || `Upgraded to ${plan}!`);
    } catch {
      setMessage('Upgrade failed. Ensure Stripe is configured on the server.');
    }
  };

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      await uploadsApi.logo(base64, file.type);
      await refresh();
      setMessage('Logo uploaded.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <PageHeader title="Settings" subtitle="Profile, invoicing defaults, reminders, and integrations" />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              tab === t ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-indigo-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {message ? <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

      {tab === 'Profile' && (
        <Card className="space-y-4">
          {(['name', 'businessName', 'businessEmail', 'businessPhone'] as const).map((field) => (
            <div key={field}>
              <label className="if-label capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
              <input value={profile[field]} onChange={(e) => setProfile({ ...profile, [field]: e.target.value })} className="if-input" />
            </div>
          ))}
          <p className="text-sm text-slate-500">Account email: {user?.email}</p>
          <button type="button" onClick={saveProfile} disabled={saving} className="if-btn-primary">Save profile</button>
        </Card>
      )}

      {tab === 'Business' && (
        <Card className="space-y-4">
          <div>
            <label className="if-label">Business address</label>
            <textarea value={profile.businessAddress} onChange={(e) => setProfile({ ...profile, businessAddress: e.target.value })} rows={3} className="if-input" />
          </div>
          <div>
            <label className="if-label">Tax ID</label>
            <input value={profile.taxId} onChange={(e) => setProfile({ ...profile, taxId: e.target.value })} className="if-input" />
          </div>
          <div>
            <label className="if-label">Business logo</label>
            <input type="file" accept="image/*" onChange={uploadLogo} className="if-input" />
          </div>
          <button type="button" onClick={saveProfile} disabled={saving} className="if-btn-primary">Save business info</button>
        </Card>
      )}

      {tab === 'Invoicing' && (
        <Card className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="if-label">Default tax rate %</label>
              <input type="number" value={settings.defaultTaxRate} onChange={(e) => setSettings({ ...settings, defaultTaxRate: e.target.value })} className="if-input" />
            </div>
            <div>
              <label className="if-label">Payment terms (days)</label>
              <input type="number" value={settings.defaultPaymentTerms} onChange={(e) => setSettings({ ...settings, defaultPaymentTerms: e.target.value })} className="if-input" />
            </div>
            <div>
              <label className="if-label">Reminder days before due</label>
              <input type="number" value={settings.reminderDaysBefore} onChange={(e) => setSettings({ ...settings, reminderDaysBefore: e.target.value })} className="if-input" disabled={!settings.enablePaymentReminders} />
            </div>
            <div>
              <label className="if-label">Reminder days after due</label>
              <input type="number" value={settings.reminderDaysAfter} onChange={(e) => setSettings({ ...settings, reminderDaysAfter: e.target.value })} className="if-input" disabled={!settings.enablePaymentReminders} />
            </div>
            <div>
              <label className="if-label">Late fee %</label>
              <input type="number" value={settings.lateFeePercent} onChange={(e) => setSettings({ ...settings, lateFeePercent: e.target.value })} className="if-input" disabled={!settings.enableLateFees} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={settings.enablePaymentReminders} onChange={(e) => setSettings({ ...settings, enablePaymentReminders: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
            Send automated payment reminders
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={settings.enableLateFees} onChange={(e) => setSettings({ ...settings, enableLateFees: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
            Apply late fees on overdue invoices
          </label>
          <div>
            <label className="if-label">Default template</label>
            <select value={settings.templateId} onChange={(e) => setSettings({ ...settings, templateId: e.target.value })} className="if-input">
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="if-label">Invoice country (compliance)</label>
            <select value={settings.invoiceCountry} onChange={(e) => setSettings({ ...settings, invoiceCountry: e.target.value })} className="if-input">
              {['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'IE'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="if-label">Legal footer on PDFs</label>
            <textarea
              value={settings.legalFooter}
              onChange={(e) => setSettings({ ...settings, legalFooter: e.target.value })}
              rows={3}
              placeholder="Registered company details, VAT reverse-charge notice, etc."
              className="if-input"
            />
          </div>
          <button type="button" onClick={saveSettings} disabled={saving} className="if-btn-primary">Save invoicing settings</button>
        </Card>
      )}

      {tab === 'Integrations' && (
        <Card className="space-y-4">
          <div>
            <label className="if-label">Webhook URL</label>
            <input value={settings.webhookUrl} onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })} placeholder="https://your-app.com/webhook" className="if-input" />
            <p className="mt-1 text-xs text-slate-500">Receive events when invoices are sent, paid, or viewed.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={saveWebhook} className="if-btn-primary">Save webhook</button>
            <button type="button" onClick={testWebhook} className="if-btn-secondary">Send test</button>
          </div>
        </Card>
      )}

      {tab === 'Referrals' && referral ? (
        <Card className="space-y-4">
          <p className="text-slate-600">{referral.reward}</p>
          <div className="rounded-xl bg-indigo-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">Your referral code</p>
            <p className="mt-1 text-2xl font-extrabold tracking-widest text-indigo-700">{referral.referralCode}</p>
            <button
              type="button"
              className="mt-3 text-sm font-semibold text-indigo-600 hover:underline"
              onClick={() => {
                const url = `${window.location.origin}/app/register?ref=${referral.referralCode}`;
                navigator.clipboard.writeText(url);
                setMessage('Referral link copied!');
              }}
            >
              Copy invite link
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-2xl font-bold">{referral.referralCount}</p>
              <p className="text-sm text-slate-500">Friends joined</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-2xl font-bold">{referral.upgradedReferrals}</p>
              <p className="text-sm text-slate-500">Upgraded to paid</p>
            </div>
          </div>
        </Card>
      ) : null}

      {tab === 'Plan' && usage ? (
        <Card className="space-y-4">
          <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-wide opacity-80">Current plan</p>
            <p className="mt-1 text-3xl font-bold capitalize">{usage.plan}</p>
            <p className="mt-2 text-indigo-100">
              {usage.used} / {usage.limit >= 999999 ? '∞' : usage.limit} invoices this month
            </p>
          </div>
          {!usage.stripeConfigured ? (
            <p className="text-sm text-amber-700 rounded-lg bg-amber-50 px-3 py-2">
              Online billing requires STRIPE_SECRET_KEY on the API. Contact your administrator or configure Stripe in Render.
            </p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => upgrade('pro')} className="if-btn-secondary justify-start text-left">
              <span className="block font-bold">Upgrade to Pro — $9.99/mo</span>
              <span className="text-xs text-slate-500">Unlimited invoices, premium templates, OCR on mobile</span>
            </button>
            <button type="button" onClick={() => upgrade('business')} className="if-btn-secondary justify-start text-left">
              <span className="block font-bold">Upgrade to Business — $19.99/mo</span>
              <span className="text-xs text-slate-500">Everything in Pro + API access</span>
            </button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
