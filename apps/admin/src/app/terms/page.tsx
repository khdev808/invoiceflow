import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-indigo-600 hover:underline">← Home</Link>
      <h1 className="mt-4 text-3xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: June 2026</p>
      <div className="prose prose-slate mt-8 space-y-4 text-slate-700">
        <p>By using InvoiceFlow you agree to these terms. InvoiceFlow provides invoicing software for freelancers and small businesses.</p>
        <p>You are responsible for the accuracy of invoices you send and for complying with tax laws in your jurisdiction.</p>
        <p>Free and paid plans are subject to usage limits described on our pricing page. We may update features and pricing with notice.</p>
        <p>The service is provided &quot;as is&quot; without warranty. Contact: legal@invoiceflow.app</p>
      </div>
    </div>
  );
}
