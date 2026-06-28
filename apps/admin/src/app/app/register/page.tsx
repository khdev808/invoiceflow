'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppApiError } from '@/lib/appApi';
import { TurnstileWidget, isTurnstileEnabled } from '@/components/security/TurnstileWidget';
import { AuthLangPicker } from '@/components/app/AuthLangPicker';
import { AuthLayout } from '@/components/app/AuthLayout';
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
    <>
      <AuthLangPicker />
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-semibold">{t('registerTitle')}</h1>
        <p className="if-subtitle text-sm">{t('registerSubtitle')}</p>
        {referralCode ? (
          <p className="mt-2 text-xs font-semibold" style={{ color: 'var(--if-accent-dark)' }}>
            {t('referralApplied')} {referralCode.toUpperCase()}
          </p>
        ) : null}
      </div>
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
          <label className="if-label">{t('yourName')}</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="if-input"
          />
        </div>
        <div>
          <label className="if-label">{t('businessNameOptional')}</label>
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="if-input"
          />
        </div>
        <div>
          <label className="if-label">{t('email')}</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="if-input"
          />
        </div>
        <div>
          <label className="if-label">{t('password')}</label>
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="if-input"
          />
        </div>
        {isTurnstileEnabled() ? (
          <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(undefined)} />
        ) : null}
        <button type="submit" disabled={loading} className="if-btn-primary w-full py-3">
          {loading ? t('creatingAccount') : t('createAccount')}
        </button>
      </form>
      <p className="mt-6 text-center text-sm" style={{ color: 'var(--if-muted)' }}>
        {t('haveAccount')}{' '}
        <Link
          href="/app/login"
          className="font-semibold hover:underline"
          style={{ color: 'var(--if-accent-dark)' }}
        >
          {t('signIn')}
        </Link>
      </p>
    </>
  );
}

function RegisterFallback() {
  const { t } = useAppLocale();
  return <p className="text-sm" style={{ color: 'var(--if-muted)' }}>{t('loading')}</p>;
}

export default function RegisterPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<RegisterFallback />}>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}
