'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppApiError } from '@/lib/appApi';
import { TurnstileWidget, isTurnstileEnabled } from '@/components/security/TurnstileWidget';
import { AuthLangPicker } from '@/components/app/AuthLangPicker';
import { useAppLocale } from '@/lib/i18n/AppLocaleContext';

function RegisterForm() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref') || '';
  const { register } = useAuth();
  const { t } = useAppLocale();
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isTurnstileEnabled() && !captchaToken) {
        setError(t('captchaRequired'));
        return;
      }
      await register({
        name,
        email,
        password,
        businessName: businessName || undefined,
        captchaToken,
        referralCode: referralCode || undefined,
      });
    } catch (err) {
      setError(err instanceof AppApiError ? err.message : t('registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <AuthLangPicker />
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">{t('registerTitle')}</h1>
          <p className="mt-2 text-sm text-slate-500">{t('registerSubtitle')}</p>
          {referralCode ? (
            <p className="mt-2 text-xs font-semibold text-indigo-600">{t('referralApplied')} {referralCode.toUpperCase()}</p>
          ) : null}
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('yourName')}</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('businessNameOptional')}</label>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('email')}</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('password')}</label>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>
          {isTurnstileEnabled() ? (
            <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(undefined)} />
          ) : null}
          <button type="submit" disabled={loading} className="if-btn-primary w-full py-3">
            {loading ? t('creatingAccount') : t('createAccount')}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          {t('haveAccount')} <Link href="/app/login" className="font-semibold text-indigo-600 hover:underline">{t('signIn')}</Link>
        </p>
      </div>
    </div>
  );
}

function RegisterFallback() {
  const { t } = useAppLocale();
  return <p className="p-8 text-center text-sm text-slate-500">{t('loading')}</p>;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterForm />
    </Suspense>
  );
}
