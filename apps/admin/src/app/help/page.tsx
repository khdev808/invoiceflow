import Link from 'next/link';

const FAQ = [
  {
    q: 'How do I create my first invoice?',
    a: 'Sign up, add a client under Clients, then click + Invoice. Pick your client, add line items, and save. Use Send to email the client a portal link.',
  },
  {
    q: 'How do clients pay?',
    a: 'When you send an invoice, your client gets an email with a link to the client portal where they can view the invoice and pay via Stripe or PayPal (when configured).',
  },
  {
    q: 'What is included in the free plan?',
    a: 'The free plan includes core invoicing with monthly limits. Upgrade to Pro or Business for higher limits, premium templates, and advanced features.',
  },
  {
    q: 'How do I connect Stripe?',
    a: 'Add your Stripe keys in Settings → Payments. For subscriptions, use the Upgrade flow in Settings → Plan.',
  },
  {
    q: 'Can I duplicate an existing invoice?',
    a: 'Yes. Open any invoice and click Duplicate to create a new draft with the same client and line items.',
  },
  {
    q: 'How do I reset my password?',
    a: 'Use Forgot password on the sign-in page. You will receive an email with a reset link (requires SMTP configured in production).',
  },
  {
    q: 'How do I delete my account or data?',
    a: 'Email support@invoiceflow.app with your account email. We process deletion requests within 30 days per our privacy policy.',
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-indigo-600 hover:underline">← Home</Link>
      <h1 className="mt-4 text-3xl font-bold">Help & FAQ</h1>
      <p className="mt-2 text-slate-600">
        Quick answers for InvoiceFlow. Need more help? Email{' '}
        <a href="mailto:support@invoiceflow.app" className="text-indigo-600 hover:underline">support@invoiceflow.app</a>.
      </p>

      <div className="mt-10 space-y-6">
        {FAQ.map((item) => (
          <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">{item.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link href="/app/login" className="text-indigo-600 hover:underline">Sign in to the app</Link>
        <Link href="/help/integrations" className="text-indigo-600 hover:underline">Zapier & webhooks</Link>
        <Link href="/help/api" className="text-indigo-600 hover:underline">REST API</Link>
        <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy policy</Link>
        <Link href="/terms" className="text-indigo-600 hover:underline">Terms of service</Link>
      </div>
    </div>
  );
}
