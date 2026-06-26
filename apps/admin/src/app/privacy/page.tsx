import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-indigo-600 hover:underline">← Home</Link>
      <h1 className="mt-4 text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: June 2026</p>
      <div className="prose prose-slate mt-8 space-y-6 text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">What we collect</h2>
          <p>InvoiceFlow (&quot;we&quot;) collects account information (name, email, business details) and invoice data you create to provide our invoicing service. We also collect usage analytics when enabled to improve the product.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Payments</h2>
          <p>Payment processing is handled by Stripe and PayPal. We do not store full card numbers on our servers.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">How we use data</h2>
          <p>We use your data to operate the service, send payment reminders you configure, and improve the product. We do not sell your personal data to third parties.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">GDPR & your rights (EEA/UK)</h2>
          <p>If you are in the EEA or UK, you have the right to access, correct, export, or delete your personal data. To exercise these rights, email <a href="mailto:privacy@invoiceflow.app" className="text-indigo-600 hover:underline">privacy@invoiceflow.app</a>. You may lodge a complaint with your local data protection authority.</p>
          <p>Our lawful basis for processing is contract performance (providing the service) and legitimate interests (security, analytics, product improvement).</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Data retention</h2>
          <p>Active account data is retained while your account exists. After account deletion, we remove personal data within 30 days except where retention is required by law (e.g. billing records). Invoice PDFs and audit logs may be retained up to 7 years where tax law requires.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Cookies & analytics</h2>
          <p>We use essential cookies for authentication. Optional analytics (PostHog) may use local storage when you use the web app and analytics keys are configured.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
          <p>Privacy inquiries: <a href="mailto:privacy@invoiceflow.app" className="text-indigo-600 hover:underline">privacy@invoiceflow.app</a></p>
        </section>
      </div>
    </div>
  );
}
