'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { authApi, AppApiError } from '@/lib/appApi';
import { TurnstileWidget, isTurnstileEnabled } from '@/components/security/TurnstileWidget';
import { AuthLayout } from '@/components/app/AuthLayout';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Invalid reset link.');
      return;
    }
    setLoading(true);
    try {
      if (isTurnstileEnabled() && !captchaToken) {
        setError('Please complete the human verification check.');
        return;
      }
      await authApi.resetPassword(token, password, captchaToken);
      router.push('/app/login?reset=1');
    } catch (err) {
      setError(err instanceof AppApiError ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="font-display text-2xl font-semibold">Choose a new password</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error ? (
          <p
            className="rounded-lg px-3 py-2 text-sm"
            style={{ background: 'var(--if-danger-soft)', color: 'var(--if-danger)' }}
          >
            {error}
          </p>
        ) : null}
        <div>
          <label className="if-label">New password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="if-input"
          />
        </div>
        <div>
          <label className="if-label">Confirm password</label>
          <input
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="if-input"
          />
        </div>
        <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(undefined)} />
        <button type="submit" disabled={loading} className="if-btn-primary w-full py-3">
          {loading ? 'Saving…' : 'Update password'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm" style={{ color: 'var(--if-muted)' }}>
        <Link
          href="/app/login"
          className="font-semibold hover:underline"
          style={{ color: 'var(--if-accent-dark)' }}
        >
          ← Back to sign in
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<p className="text-sm" style={{ color: 'var(--if-muted)' }}>Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
