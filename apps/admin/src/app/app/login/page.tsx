'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppApiError } from '@/lib/appApi';
import { TurnstileWidget, isTurnstileEnabled } from '@/components/security/TurnstileWidget';
import { AuthLangPicker } from '@/components/app/AuthLangPicker';
import { useAppLocale } from '@/lib/i18n/AppLocaleContext';

function LoginForm() {
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { t } = useAppLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const expired = searchParams.get('expired') === '1';
  const reset = searchParams.get('reset') === '1';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isTurnstileEnabled() && !captchaToken) {
        setError(t('captchaRequired'));
        return;
      }
      await login(email, password, captchaToken);
    } catch (err) {
      setError(err instanceof AppApiError ? err.message : t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <AuthLangPicker />
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white">
          IF
        </div>
        <h1 className="text-2xl font-bold">{t('signInTitle')}</h1>
        <p className="mt-2 text-sm text-slate-500">{t('signInSubtitle')}</p>
      </div>
      {expired ? <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{t('sessionExpired')}</p> : null}
      {reset ? <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{t('passwordUpdated')}</p> : null}
      <form onSubmit={onSubmit} className="space-y-4">
        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{t('email')}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">{t('password')}</label>
            <Link href="/app/forgot-password" className="text-xs font-semibold text-indigo-600 hover:underline">
              {t('forgotPassword')}
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(undefined)} />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
        >
          {loading ? t('signingIn') : t('signIn')}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        {t('noAccount')}{' '}
        <Link href="/app/register" className="font-semibold text-indigo-600 hover:underline">
          {t('createOneFree')}
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-slate-500">
        <Link href="/" className="hover:text-indigo-600">
          {t('backToHome')}
        </Link>
      </p>
    </div>
  );
}

function LoginFallback() {
  const { t } = useAppLocale();
  return <p className="text-sm text-slate-500">{t('loading')}</p>;
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC] px-4">
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
