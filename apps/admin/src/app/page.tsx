import Link from 'next/link';

const features = [
  {
    title: 'Invoice in 30 seconds',
    description: 'Create professional invoices, estimates, and credit notes from your phone.',
    icon: '⚡',
  },
  {
    title: 'Get paid faster',
    description: 'Stripe, PayPal, QR codes, and a client portal with deposit support.',
    icon: '💳',
  },
  {
    title: 'Never chase payments',
    description: 'Automated reminders, late fees, and alerts when clients pay.',
    icon: '🔔',
  },
  {
    title: 'Works offline',
    description: 'Draft invoices on the go — sync when you are back online.',
    icon: '📱',
  },
];

const plans = [
  { name: 'Free', price: '$0', detail: '25 invoices / month' },
  { name: 'Pro', price: '$9.99', detail: 'Unlimited invoices + premium templates' },
  { name: 'Business', price: '$19.99', detail: 'Team features & API access' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F6F8FC] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-200">
              IF
            </div>
            <span className="text-lg font-bold tracking-tight">InvoiceFlow</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="hover:text-indigo-600">Features</a>
            <a href="#pricing" className="hover:text-indigo-600">Pricing</a>
            <Link href="/admin" className="hover:text-indigo-600">Admin</Link>
          </nav>
          <Link
            href="/admin"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:opacity-95"
          >
            Sign In
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 pb-20 pt-16 md:pt-24">
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
              Built for freelancers & trades
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl md:leading-[1.05]">
              Professional invoices in{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                under 30 seconds
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              InvoiceFlow helps solo businesses send invoices, track payments, and get paid — without
              expensive subscriptions or clunky desktop software.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#pricing"
                className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 hover:opacity-95"
              >
                Start free — 25 invoices/mo
              </a>
              <a
                href="#features"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700"
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              { label: 'Avg. time to invoice', value: '28s' },
              { label: 'Payment methods', value: 'Stripe + PayPal' },
              { label: 'Languages supported', value: '5' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-slate-200 bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Everything you need to get paid</h2>
          <p className="mt-3 max-w-2xl text-slate-600">Mobile-first invoicing with the features freelancers actually use.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="mb-4 text-3xl">{feature.icon}</div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="mt-2 text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Simple, honest pricing</h2>
          <p className="mt-3 text-slate-600">Start free. Upgrade when your business grows.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 text-left ${
                  i === 1
                    ? 'border-indigo-300 bg-gradient-to-b from-indigo-50 to-white shadow-lg shadow-indigo-100'
                    : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{plan.name}</p>
                <p className="mt-2 text-4xl font-extrabold">{plan.price}<span className="text-base font-medium text-slate-500">/mo</span></p>
                <p className="mt-3 text-slate-600">{plan.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} InvoiceFlow. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/admin" className="hover:text-indigo-600">Admin panel</Link>
            <a href="#" className="hover:text-indigo-600">Privacy</a>
            <a href="#" className="hover:text-indigo-600">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
