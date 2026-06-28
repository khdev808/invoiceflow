'use client';

import Link from 'next/link';
import { useState } from 'react';
import { authApi, AppApiError } from '@/lib/appApi';
import { TurnstileWidget, isTurnstileEnabled } from '@/components/security/TurnstileWidget';
import { AuthLayout } from '@/components/app/AuthLayout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      if (isTurnstileEnabled() && !captchaToken) {
        setError('Please complete the human verification check.');
        return;
      }
      const res = await authApi.forgotPassword(email, captchaToken);
      setMessage(res.message);
    } catch (err) {
      setError(err instanceof AppApiError ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="font-display text-2xl font-semibold">Reset your password</h1>
      <p className="if-subtitle text-sm">We will email you a link to choose a new password.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error ? (
          <p
            className="rounded-lg px-3 py-2 text-sm"
            style={{ background: 'var(--if-danger-soft)', color: 'var(--if-danger)' }}
          >
            {error}
          </p>
        ) : null}
        {message ? (
          <p
            className="rounded-lg px-3 py-2 text-sm"
            style={{ background: 'var(--if-success-soft)', color: 'var(--if-success)' }}
          >
            {message}
          </p>
        ) : null}
        <div>
          <label className="if-label">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="if-input"
          />
        </div>
        <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(undefined)} />
        <button type="submit" disabled={loading} className="if-btn-primary w-full py-3">
          {loading ? 'Sending…' : 'Send reset link'}
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
    </AuthLayout>
  );
}
