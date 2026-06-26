'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function CheckoutForm({ amount, currency, onSuccess }: { amount: number; currency: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');
    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href.split('?')[0] + '?paid=1' },
      redirect: 'if_required',
    });
    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setLoading(false);
      return;
    }
    onSuccess();
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="button"
        onClick={pay}
        disabled={!stripe || loading}
        className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-4 text-lg font-bold text-white shadow-lg disabled:opacity-60"
      >
        {loading ? 'Processing…' : `Pay ${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}`}
      </button>
      <p className="text-center text-xs text-slate-500">Apple Pay, Google Pay, and cards accepted</p>
    </div>
  );
}

export function PortalStripePay({ invoiceId, onPaid }: { invoiceId: string; onPaid: () => void }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/payments/public/intent/${invoiceId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.clientSecret && data.publishableKey) {
          setClientSecret(data.clientSecret);
          setPublishableKey(data.publishableKey);
          setAmount(data.amount);
          setCurrency(data.currency || 'USD');
        }
      })
      .finally(() => setLoading(false));
  }, [invoiceId]);

  if (loading) return null;
  if (!clientSecret || !publishableKey) return null;

  const stripePromise = loadStripe(publishableKey);

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="mb-4 text-sm font-bold text-slate-700">Pay securely</p>
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
        <CheckoutForm amount={amount} currency={currency} onSuccess={onPaid} />
      </Elements>
    </div>
  );
}
