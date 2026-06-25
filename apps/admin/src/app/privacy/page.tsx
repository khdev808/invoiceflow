import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-indigo-600 hover:underline">← Home</Link>
      <h1 className="mt-4 text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: June 2026</p>
      <div className="prose prose-slate mt-8 space-y-4 text-slate-700">
        <p>InvoiceFlow (&quot;we&quot;) respects your privacy. We collect account information (name, email, business details) and invoice data you create to provide our invoicing service.</p>
        <p>Payment processing is handled by Stripe and PayPal. We do not store full card numbers on our servers.</p>
        <p>We use your data to operate the service, send payment reminders you configure, and improve the product. We do not sell your personal data.</p>
        <p>Contact: privacy@invoiceflow.app</p>
      </div>
    </div>
  );
}
