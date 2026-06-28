'use client';

import { useEffect, useState } from 'react';
import { integrationsApi, planApi, referralsApi, uploadsApi, usersApi } from '@/lib/appApi';
import { templates } from '@/lib/constants';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { COUNTRY_COMPLIANCE, getCountryCompliance } from '@/lib/countryCompliance';
import { useAppLocale } from '@/lib/i18n/AppLocaleContext';
import type { AppTranslationKey } from '@/lib/i18n/app/en';

const TAB_KEYS: Record<string, AppTranslationKey> = {
  Profile: 'tabProfile',
  Business: 'tabBusiness',
  Invoicing: 'tabInvoicing',
  Integrations: 'tabIntegrations',
  Referrals: 'tabReferrals',
  Plan: 'tabPlan',
};

const TABS = ['Profile', 'Business', 'Invoicing', 'Integrations', 'Referrals', 'Plan'] as const;

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const { t } = useAppLocale();
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

  const compliance = getCountryCompliance(settings.invoiceCountry);

  const onCountryChange = (code: string) => {
    const next = getCountryCompliance(code);
    setSettings((prev) => ({
      ...prev,
      invoiceCountry: code,
      legalFooter: prev.legalFooter.trim() ? prev.legalFooter : (next.defaultLegalFooter || ''),
    }));
  };

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <PageHeader title={t('settingsTitle')} subtitle={t('settingsSubtitle')} />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setTab(tabKey)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              tab === tabKey ? 'text-white shadow-md' : 'bg-white ring-1 ring-[var(--if-border)] hover:ring-[var(--if-accent)]/30'
            }`}
            style={tab === tabKey ? { background: 'var(--if-accent)' } : { color: 'var(--if-muted)' }}
          >
            {t(TAB_KEYS[tabKey])}
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
          <button type="button" onClick={saveProfile} disabled={saving} className="if-btn-primary">{t('saveProfile')}</button>
        </Card>
      )}

      {tab === 'Business' && (
        <Card className="space-y-4">
          <div>
            <label className="if-label">Business address</label>
            <textarea value={profile.businessAddress} onChange={(e) => setProfile({ ...profile, businessAddress: e.target.value })} rows={3} className="if-input" />
          </div>
          <div>
            <label className="if-label">{compliance.businessTaxIdLabel}</label>
            <input value={profile.taxId} onChange={(e) => setProfile({ ...profile, taxId: e.target.value })} className="if-input" placeholder={compliance.businessTaxIdLabel} />
          </div>
          <div>
            <label className="if-label">Business logo</label>
            <input type="file" accept="image/*" onChange={uploadLogo} className="if-input" />
          </div>
          <button type="button" onClick={saveProfile} disabled={saving} className="if-btn-primary">{t('saveBusiness')}</button>
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
            <input type="checkbox" checked={settings.enablePaymentReminders} onChange={(e) => setSettings({ ...settings, enablePaymentReminders: e.target.checked })} className="h-4 w-4 rounded accent-[var(--if-accent)]" />
            Send automated payment reminders
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={settings.enableLateFees} onChange={(e) => setSettings({ ...settings, enableLateFees: e.target.checked })} className="h-4 w-4 rounded accent-[var(--if-accent)]" />
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
            <select value={settings.invoiceCountry} onChange={(e) => onCountryChange(e.target.value)} className="if-input">
              {COUNTRY_COMPLIANCE.map((c) => (
                <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">PDFs use {compliance.taxLabel} labels and {compliance.clientTaxIdLabel} fields for this country.</p>
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
          <button type="button" onClick={saveSettings} disabled={saving} className="if-btn-primary">{t('saveInvoicing')}</button>
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
          <p className="text-sm text-slate-600">
            Connect Zapier or Make — see <a href="/help/integrations" className="hover:underline" style={{ color: 'var(--if-accent-dark)' }}>integration guide</a>.
            For REST API access, see <a href="/help/api" className="hover:underline" style={{ color: 'var(--if-accent-dark)' }}>API documentation</a>.
          </p>
        </Card>
      )}

      {tab === 'Referrals' && referral ? (
        <Card className="space-y-4">
          <p className="text-slate-600">{referral.reward}</p>
          <div className="rounded-xl p-4" style={{ background: 'var(--if-accent-soft)' }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--if-accent-dark)' }}>Your referral code</p>
            <p className="mt-1 text-2xl font-extrabold tracking-widest" style={{ color: 'var(--if-text)' }}>{referral.referralCode}</p>
            <button
              type="button"
              className="mt-3 text-sm font-semibold hover:underline"
              style={{ color: 'var(--if-accent-dark)' }}
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
          <div className="rounded-xl p-6 text-white" style={{ background: 'var(--if-text)' }}>
            <p className="text-sm font-semibold uppercase tracking-wide opacity-80">Current plan</p>
            <p className="mt-1 text-3xl font-bold capitalize">{usage.plan}</p>
            <p className="mt-2 opacity-80">
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
