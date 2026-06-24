import Link from 'next/link';

const differentiators = [
  {
    headline: '30 seconds. Not 3 minutes.',
    body: 'QuickBooks and FreshBooks were built for accountants first. InvoiceFlow was built for your phone first — create and send a professional invoice in about 9 taps.',
    vs: 'vs QuickBooks, FreshBooks, Wave',
  },
  {
    headline: '$9.99/month. Not $8.99/week.',
    body: 'Invoice Fly charges roughly $39/month. Invoice Simple locks real features behind $19.99/month. HubSpark Pro starts at $39. InvoiceFlow Pro is $9.99 — with mileage, OCR, time tracking, and credit notes included.',
    vs: 'vs Invoice Fly, Invoice Simple, HubSpark',
  },
  {
    headline: 'Free that actually works.',
    body: '25 invoices per month free — unlimited clients, Stripe + PayPal, reminders, and a client portal. Wave is free but slow on mobile. Zoho free tier slaps their branding on your documents.',
    vs: 'vs Wave, Zoho Invoice',
  },
  {
    headline: 'One app. Not five subscriptions.',
    body: 'Invoices, estimates, credit notes, expenses, receipt scan, time → invoice, mileage, recurring billing, and P&L reports — without paying for FreshBooks time tracking + a separate expense app.',
    vs: 'vs Invoice Fly, Invoice Simple',
  },
  {
    headline: 'Get paid your way.',
    body: 'Stripe, PayPal, QR codes, deposit requests, client portal payments, WhatsApp share, and automated late fees — features Wave and Invoice Simple skip or charge extra for.',
    vs: 'vs Wave, Invoice Simple, Square',
  },
  {
    headline: 'Built to sync. Built to work offline.',
    body: 'Real PostgreSQL cloud sync — not the flaky sync users complain about on Invoice Fly. Draft invoices offline; they sync when you\'re back on signal. Dark mode, 5 languages, 6 currencies.',
    vs: 'vs Invoice Fly, desktop-first tools',
  },
];

const features = [
  { title: 'Invoices, estimates & credit notes', description: 'Full document workflow — not just invoices. Convert estimates to invoices in one tap.', icon: '📄' },
  { title: 'Deposits & late fees', description: 'Request % or flat deposits. Automated reminders and late fees run on the server — set once, forget.', icon: '💰' },
  { title: 'Time, expenses & mileage', description: 'Log hours and bill them to invoices. Scan receipts with OCR. Track mileage at IRS rates.', icon: '⏱️' },
  { title: 'Client portal + e-sign', description: 'Clients pay and sign estimates in the browser — no app required. You get open-tracking alerts.', icon: '✍️' },
  { title: 'Recurring & reminders', description: 'Auto-generate recurring invoices. Daily cron sends payment nudges before and after due dates.', icon: '🔁' },
  { title: 'Works offline', description: 'Create invoices without signal. Invoice list and clients cache locally and sync when you reconnect.', icon: '📶' },
];

const comparisons = [
  { feature: 'Mobile invoice speed', invoiceflow: '✓ ~30 sec', invoiceFly: '✓ Fast', wave: '✗ Slow app', freshbooks: '⚠ Desktop-first', invoiceSimple: '✓ Fast' },
  { feature: 'Free tier', invoiceflow: '✓ 25/mo', invoiceFly: '✗ Paid', wave: '✓ Unlimited', freshbooks: '✗ Trial only', invoiceSimple: '⚠ Limited' },
  { feature: 'Pro price', invoiceflow: '$9.99/mo', invoiceFly: '~$39/mo', wave: 'Free (+ fees)', freshbooks: '$23+/mo', invoiceSimple: '$19.99/mo' },
  { feature: 'Time → invoice', invoiceflow: '✓ Built-in', invoiceFly: '✗', wave: '✗', freshbooks: '✓ Best', invoiceSimple: '✗' },
  { feature: 'Mileage tracking', invoiceflow: '✓ IRS rate', invoiceFly: '✗', wave: '✗', freshbooks: '✓', invoiceSimple: '✗' },
  { feature: 'Expense + OCR', invoiceflow: '✓', invoiceFly: '✓', wave: '✓', freshbooks: '✓', invoiceSimple: '✗' },
  { feature: 'Credit notes', invoiceflow: '✓', invoiceFly: '✗', wave: '✓', freshbooks: '✓', invoiceSimple: '✗' },
  { feature: 'Automated late fees', invoiceflow: '✓ Cron', invoiceFly: '⚠', wave: '✗', freshbooks: '✓', invoiceSimple: '✗' },
  { feature: 'Offline mode', invoiceflow: '✓', invoiceFly: '⚠', wave: '✗', freshbooks: '⚠', invoiceSimple: '✓' },
  { feature: 'Multi-language', invoiceflow: '✓ 5 langs', invoiceFly: '✓', wave: '✗', freshbooks: '✓', invoiceSimple: '✗' },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    detail: '25 invoices/month · unlimited clients · Stripe & PayPal · client portal',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    detail: 'Unlimited invoices · premium templates · no branding · priority features',
    highlight: true,
    badge: 'Most popular',
  },
  {
    name: 'Business',
    price: '$19.99',
    detail: 'Everything in Pro · team seats · API access · white-label portal (coming)',
    highlight: false,
  },
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
            <a href="#why" className="hover:text-indigo-600">Why us</a>
            <a href="#compare" className="hover:text-indigo-600">Compare</a>
            <a href="#features" className="hover:text-indigo-600">Features</a>
            <a href="#pricing" className="hover:text-indigo-600">Pricing</a>
          </nav>
          <a
            href="#download"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:opacity-95"
          >
            Get started free
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-16 md:pt-24">
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="mb-4 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
              The invoice app that doesn&apos;t nickel-and-dime you
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl md:leading-[1.05]">
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Invoice Fly speed.
              </span>{' '}
              FreshBooks features.{' '}
              <span className="text-slate-900">Wave&apos;s price.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              InvoiceFlow is the mobile-first invoicing app for freelancers, contractors, and solo trades
              who are tired of $40/week subscriptions, slow desktop software, and apps that charge extra
              for time tracking, mileage, and reminders.
            </p>
            <p className="mt-4 max-w-2xl text-base font-semibold text-slate-800">
              Send a professional invoice in under 30 seconds. Get paid via Stripe, PayPal, or your client portal.
              Automate reminders and late fees. Works offline.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#download"
                className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 hover:opacity-95"
              >
                Start free — 25 invoices/month
              </a>
              <a
                href="#compare"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700"
              >
                See how we beat the big names
              </a>
            </div>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'vs Invoice Fly', value: 'Save ~$350/yr', sub: 'at Pro tier' },
              { label: 'vs FreshBooks', value: 'Save ~$156/yr', sub: 'Lite plan' },
              { label: 'Time to invoice', value: '~30 sec', sub: '9 taps on mobile' },
              { label: 'All-in-one', value: '12+ tools', sub: 'in one subscription' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{item.value}</p>
                <p className="text-sm text-slate-500">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section id="why" className="border-t border-slate-200 bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Why InvoiceFlow</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Built different from the apps you&apos;ve already tried
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-slate-600">
            We studied Invoice Fly, Wave, FreshBooks, Invoice Simple, QuickBooks, Zoho, and HubSpark —
            then built the app their 1-star reviews are asking for.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {differentiators.map((d) => (
              <div
                key={d.headline}
                className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">{d.vs}</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{d.headline}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section id="compare" className="border-t border-slate-200 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            How InvoiceFlow stacks up
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            An honest side-by-side with the most-downloaded invoice apps. We win on price, speed, and
            all-in-one value — without sacrificing payments or automation.
          </p>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 font-semibold text-slate-500">Feature</th>
                  <th className="px-4 py-3 font-bold text-indigo-700">InvoiceFlow</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Invoice Fly</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Wave</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">FreshBooks</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Invoice Simple</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row) => (
                  <tr key={row.feature} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-800">{row.feature}</td>
                    <td className="px-4 py-3 font-semibold text-indigo-700">{row.invoiceflow}</td>
                    <td className="px-4 py-3 text-slate-600">{row.invoiceFly}</td>
                    <td className="px-4 py-3 text-slate-600">{row.wave}</td>
                    <td className="px-4 py-3 text-slate-600">{row.freshbooks}</td>
                    <td className="px-4 py-3 text-slate-600">{row.invoiceSimple}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Competitor pricing and features based on public listings as of 2026. Invoice Fly ≈ $8.99/week;
            FreshBooks Lite ≈ $23/month; Invoice Simple Pro ≈ $19.99/month.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-slate-200 bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need. Nothing you don&apos;t.
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Not a stripped-down &quot;invoice only&quot; app. Not bloated accounting software.
            The sweet spot for solo businesses who invoice from their phone.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="mb-4 text-3xl">{feature.icon}</div>
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="border-t border-slate-200 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-8 text-white md:p-12">
            <h2 className="text-3xl font-bold md:text-4xl">Who InvoiceFlow is for</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {[
                {
                  title: 'Perfect fit',
                  items: [
                    'Freelancers & consultants invoicing from their phone',
                    'Trades — plumbers, electricians, cleaners, landscapers',
                    'Side hustles outgrowing spreadsheets',
                    'Invoice Fly / Invoice Simple users tired of weekly fees',
                    'Wave users who need faster mobile + multi-currency',
                  ],
                },
                {
                  title: 'Not the right tool (yet)',
                  items: [
                    'Full double-entry accounting (use QuickBooks)',
                    'Payroll & inventory (use Square / QBO)',
                    'Large teams with complex approvals',
                    '40+ payment gateways (use Zoho / Invoice Ninja)',
                  ],
                },
              ].map((col) => (
                <div key={col.title} className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-bold">{col.title}</h3>
                  <ul className="mt-4 space-y-2 text-sm text-indigo-100">
                    {col.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span>{col.title === 'Perfect fit' ? '✓' : '—'}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-slate-200 bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Pricing that respects your business
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Start free with 25 invoices per month. Upgrade to Pro for less than a single week of Invoice Fly.
          </p>
          <div className="mt-10 grid gap-6 text-left md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 ${
                  plan.highlight
                    ? 'border-indigo-300 bg-gradient-to-b from-indigo-50 to-white shadow-lg shadow-indigo-100'
                    : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                {plan.badge ? (
                  <span className="absolute -top-3 left-6 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-bold text-white">
                    {plan.badge}
                  </span>
                ) : null}
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{plan.name}</p>
                <p className="mt-2 text-4xl font-extrabold">
                  {plan.price}
                  {plan.price !== '$0' && (
                    <span className="text-base font-medium text-slate-500">/mo</span>
                  )}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{plan.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section id="download" className="border-t border-slate-200 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Stop overpaying. Start invoicing smarter.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Download InvoiceFlow on iOS or Android. Create your first invoice in under a minute.
            No credit card required on the free plan.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-left shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">iOS</p>
              <p className="font-bold text-slate-900">App Store</p>
              <p className="text-sm text-slate-500">Coming at launch</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-left shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">Android</p>
              <p className="font-bold text-slate-900">Google Play</p>
              <p className="text-sm text-slate-500">Coming at launch</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/admin" className="font-semibold text-indigo-600 hover:underline">
              Sign in to admin
            </Link>
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} InvoiceFlow. Invoice Fly speed. FreshBooks depth. Wave&apos;s price.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/admin" className="hover:text-indigo-600">Admin</Link>
            <a href="#" className="hover:text-indigo-600">Privacy</a>
            <a href="#" className="hover:text-indigo-600">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
