'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppApiError } from '@/lib/appApi';
import { TurnstileWidget, isTurnstileEnabled } from '@/components/security/TurnstileWidget';
import { AuthLangPicker } from '@/components/app/AuthLangPicker';
import { AuthLayout } from '@/components/app/AuthLayout';
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
    <>
      <AuthLangPicker />
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-semibold">{t('signInTitle')}</h1>
        <p className="if-subtitle text-sm">{t('signInSubtitle')}</p>
      </div>
      {expired ? (
        <p
          className="mb-4 rounded-lg px-3 py-2 text-sm"
          style={{ background: 'var(--if-warning-soft)', color: 'var(--if-warning)' }}
        >
          {t('sessionExpired')}
        </p>
      ) : null}
      {reset ? (
        <p
          className="mb-4 rounded-lg px-3 py-2 text-sm"
          style={{ background: 'var(--if-success-soft)', color: 'var(--if-success)' }}
        >
          {t('passwordUpdated')}
        </p>
      ) : null}
      <form onSubmit={onSubmit} className="space-y-4">
        {error ? (
          <p
            className="rounded-lg px-3 py-2 text-sm"
            style={{ background: 'var(--if-danger-soft)', color: 'var(--if-danger)' }}
          >
            {error}
          </p>
        ) : null}
        <div>
          <label className="if-label">{t('email')}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="if-input"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium" style={{ color: 'var(--if-text)' }}>
              {t('password')}
            </label>
            <Link
              href="/app/forgot-password"
              className="text-xs font-semibold hover:underline"
              style={{ color: 'var(--if-accent-dark)' }}
            >
              {t('forgotPassword')}
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="if-input"
          />
        </div>
        <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(undefined)} />
        <button type="submit" disabled={loading} className="if-btn-primary w-full py-3">
          {loading ? t('signingIn') : t('signIn')}
        </button>
      </form>
      <p className="mt-6 text-center text-sm" style={{ color: 'var(--if-muted)' }}>
        {t('noAccount')}{' '}
        <Link
          href="/app/register"
          className="font-semibold hover:underline"
          style={{ color: 'var(--if-accent-dark)' }}
        >
          {t('createOneFree')}
        </Link>
      </p>
      <p className="mt-3 text-center text-sm" style={{ color: 'var(--if-muted)' }}>
        <Link href="/" className="transition-colors hover:underline" style={{ color: 'var(--if-accent-dark)' }}>
          {t('backToHome')}
        </Link>
      </p>
    </>
  );
}

function LoginFallback() {
  const { t } = useAppLocale();
  return <p className="text-sm" style={{ color: 'var(--if-muted)' }}>{t('loading')}</p>;
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
