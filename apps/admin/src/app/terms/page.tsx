import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-indigo-600 hover:underline">← Home</Link>
      <h1 className="mt-4 text-3xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: June 2026</p>
      <div className="prose prose-slate mt-8 space-y-6 text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Agreement</h2>
          <p>By using InvoiceFlow you agree to these terms. InvoiceFlow provides invoicing software for freelancers and small businesses.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Your responsibilities</h2>
          <p>You are responsible for the accuracy of invoices you send and for complying with tax laws in your jurisdiction. You must not use the service for fraudulent or illegal activity.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Plans & billing</h2>
          <p>Free and paid plans are subject to usage limits described on our pricing page. Paid subscriptions renew automatically until cancelled. We may update features and pricing with reasonable notice.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Availability</h2>
          <p>We aim for high uptime but do not guarantee uninterrupted service. Scheduled maintenance may occur with notice when possible.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Limitation of liability</h2>
          <p>The service is provided &quot;as is&quot; without warranty. InvoiceFlow is not liable for indirect damages, lost profits, or tax penalties arising from your use of the service.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
          <p>Legal inquiries: <a href="mailto:legal@invoiceflow.app" className="text-indigo-600 hover:underline">legal@invoiceflow.app</a></p>
        </section>
      </div>
    </div>
  );
}
