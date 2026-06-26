import Link from 'next/link';

export const metadata = {
  title: 'Case Study — Freelance Designer Saves 5 Hours/Month | InvoiceFlow',
  description: 'How a freelance designer switched from Invoice Fly to InvoiceFlow and cut invoicing time from 20 minutes to under 60 seconds per invoice.',
};

export default function DesignerCaseStudyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <article className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-indigo-600 hover:underline">← InvoiceFlow</Link>
        <p className="mt-4 text-sm font-bold uppercase tracking-widest text-violet-500">Case study</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
          Freelance designer saves 5+ hours a month on invoicing
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Maria runs a one-person brand studio in Austin. She was on Invoice Fly until clients started asking for Apple Pay and faster portal links.
        </p>

        <section className="mt-10 space-y-6 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">The problem</h2>
          <p>
            Maria sent 12–18 invoices per month. Each one took about 20 minutes: duplicate an old PDF, fix line items, export, attach to email, chase payment on Venmo.
            Invoice Fly worked, but mobile editing was slow and clients wanted a single pay link with card wallets.
          </p>

          <h2 className="text-xl font-bold text-slate-900">The switch</h2>
          <p>
            She moved to InvoiceFlow in an afternoon. First invoice went out in 47 seconds: same client auto-filled, template she liked, portal link in the email.
            Two clients paid via Apple Pay the same week — something she could not offer before without a separate Stripe setup.
          </p>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="text-2xl font-extrabold text-emerald-800">~5 hours saved / month</p>
            <p className="mt-2 text-sm text-emerald-700">
              15 invoices × 19 minutes saved ≈ 4.75 hours, plus faster payment collection.
            </p>
          </div>

          <h2 className="text-xl font-bold text-slate-900">What she uses daily</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Mobile app to invoice from client meetings</li>
            <li>Duplicate invoice + last-client shortcut</li>
            <li>Client portal with Stripe (cards + Apple Pay)</li>
            <li>WhatsApp share when email is slow</li>
            <li>Time entries → invoice line items for retainer overages</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900">Cost comparison</h2>
          <p>
            Invoice Fly Pro was ~$8/month. InvoiceFlow Pro is $9.99 with OCR, recurring invoices, and branded PDFs included.
            Maria considers the extra $2 worthwhile for portal wallet payments alone — one paid invoice covers the year.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/app/register" className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-indigo-700">
            Try InvoiceFlow free
          </Link>
          <Link href="/alternatives/invoice-fly" className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 hover:border-indigo-200">
            Compare vs Invoice Fly
          </Link>
        </div>
      </article>
    </div>
  );
}
