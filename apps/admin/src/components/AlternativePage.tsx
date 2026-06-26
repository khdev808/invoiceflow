import Link from 'next/link';

type Props = {
  competitor: string;
  title: string;
  subtitle: string;
  bullets: string[];
};

export function AlternativePage({ competitor, title, subtitle, bullets }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-indigo-600 hover:underline">← InvoiceFlow</Link>
        <p className="mt-4 text-sm font-bold uppercase tracking-widest text-indigo-500">{competitor} alternative</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-4 text-lg text-slate-600">{subtitle}</p>

        <ul className="mt-8 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 text-slate-700 shadow-sm">
              <span className="text-emerald-500">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/app/register" className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-indigo-700">
            Start free — no credit card
          </Link>
          <Link href="/help" className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700">
            See how it works
          </Link>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          InvoiceFlow: professional invoices in under 60 seconds. Free plan with 25 invoices/month. Pro $9.99.
        </p>
      </div>
    </div>
  );
}
