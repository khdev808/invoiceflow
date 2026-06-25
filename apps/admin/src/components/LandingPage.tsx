'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import type { TranslationKey } from '@/lib/i18n/en';

const DIFF_KEYS = [1, 2, 3, 4, 5, 6] as const;
const REASON_KEYS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const REASON_ICONS = ['⚡', '🎁', '💎', '💳', '✍️', '🌐', '☁️', '🎯'];
const COMPARE_ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const FEATURE_KEYS = [1, 2, 3, 4, 5, 6] as const;
const FEATURE_ICONS = ['📄', '💰', '⏱️', '✍️', '🔁', '📶'];

export function LandingPage() {
  const { t, isRtl } = useLocale();
  const year = new Date().getFullYear();

  const stats = [
    { label: t('stat1Label'), value: t('stat1Value'), sub: t('stat1Sub') },
    { label: t('stat2Label'), value: t('stat2Value'), sub: t('stat2Sub') },
    { label: t('stat3Label'), value: t('stat3Value'), sub: t('stat3Sub') },
    { label: t('stat4Label'), value: t('stat4Value'), sub: t('stat4Sub') },
  ];

  const differentiators = DIFF_KEYS.map((n) => ({
    vs: t(`diff${n}Vs` as TranslationKey),
    headline: t(`diff${n}Headline` as TranslationKey),
    body: t(`diff${n}Body` as TranslationKey),
  }));

  const comparisons = COMPARE_ROWS.map((n) => ({
    feature: t(`cr${n}Feature` as TranslationKey),
    invoiceflow: t(`cr${n}IF` as TranslationKey),
    invoiceFly: t(`cr${n}Fly` as TranslationKey),
    wave: t(`cr${n}Wave` as TranslationKey),
    freshbooks: t(`cr${n}FB` as TranslationKey),
    invoiceSimple: t(`cr${n}IS` as TranslationKey),
  }));

  const features = FEATURE_KEYS.map((n, i) => ({
    icon: FEATURE_ICONS[i],
    title: t(`feat${n}Title` as TranslationKey),
    description: t(`feat${n}Desc` as TranslationKey),
  }));

  const plans = [
    { name: t('planFreeName'), price: '$0', detail: t('planFreeDetail'), highlight: false, badge: null },
    { name: t('planProName'), price: '$9.99', detail: t('planProDetail'), highlight: true, badge: t('planProBadge') },
    { name: t('planBusinessName'), price: '$19.99', detail: t('planBusinessDetail'), highlight: false, badge: null },
  ];

  const reasons = REASON_KEYS.map((n, i) => ({
    icon: REASON_ICONS[i],
    title: t(`reason${n}Title` as TranslationKey),
    body: t(`reason${n}Body` as TranslationKey),
  }));

  const whoColumns = [
    {
      title: t('whoPerfectTitle'),
      items: [t('whoPerfect1'), t('whoPerfect2'), t('whoPerfect3'), t('whoPerfect4'), t('whoPerfect5')],
      check: true,
    },
    {
      title: t('whoNotTitle'),
      items: [t('whoNot1'), t('whoNot2'), t('whoNot3'), t('whoNot4')],
      check: false,
    },
  ];

  return (
    <div className={`min-h-screen bg-[#F6F8FC] text-slate-900 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-200">
              IF
            </div>
            <span className="text-lg font-bold tracking-tight">InvoiceFlow</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#reasons" className="hover:text-indigo-600">{t('reasonsLabel')}</a>
            <a href="#why" className="hover:text-indigo-600">{t('navWhy')}</a>
            <a href="#compare" className="hover:text-indigo-600">{t('navCompare')}</a>
            <a href="#features" className="hover:text-indigo-600">{t('navFeatures')}</a>
            <a href="#pricing" className="hover:text-indigo-600">{t('navPricing')}</a>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Link href="/app/login" className="hidden text-sm font-medium text-slate-600 hover:text-indigo-600 sm:inline-block">
              {t('downloadSignIn')}
            </Link>
            <Link
              href="/app/register"
              className="hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:opacity-95 sm:inline-block"
            >
              {t('navGetStarted')}
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 pb-20 pt-16 md:pt-24">
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="mb-4 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
              {t('heroBadge')}
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl md:leading-[1.05]">
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {t('heroTitle1')}
              </span>{' '}
              {t('heroTitle2')}{' '}
              <span className="text-slate-900">{t('heroTitle3')}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">{t('heroDesc1')}</p>
            <p className="mt-4 max-w-2xl text-base font-semibold text-slate-800">{t('heroDesc2')}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/app/register"
                className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 hover:opacity-95"
              >
                {t('ctaStartFree')}
              </Link>
              <Link
                href="/app"
                className="rounded-2xl border border-indigo-200 bg-indigo-50 px-6 py-3.5 text-base font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                {t('ctaWebApp')}
              </Link>
              <a
                href="#compare"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700"
              >
                {t('ctaCompare')}
              </a>
            </div>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{item.value}</p>
                <p className="text-sm text-slate-500">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reasons" className="border-t border-slate-200 bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">{t('reasonsLabel')}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{t('reasonsTitle')}</h2>
          <p className="mt-4 max-w-3xl text-lg text-slate-600">{t('reasonsDesc')}</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((r) => (
              <div key={r.title} className="rounded-2xl border border-slate-200 bg-gradient-to-b from-indigo-50/50 to-white p-6 shadow-sm">
                <div className="mb-3 text-2xl">{r.icon}</div>
                <h3 className="text-lg font-bold text-slate-900">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 px-6 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-700 p-8 text-center text-white md:flex-row md:p-12 md:text-left">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold md:text-3xl">{t('webAppTitle')}</h2>
            <p className="mt-3 text-indigo-100">{t('webAppDesc')}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/app" className="rounded-2xl bg-white px-6 py-3 font-semibold text-indigo-700 hover:bg-indigo-50">
              {t('webAppCta')}
            </Link>
            <Link href="/app/register" className="rounded-2xl border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10">
              {t('webAppRegister')}
            </Link>
          </div>
        </div>
      </section>

      <section id="why" className="border-t border-slate-200 bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">{t('whyLabel')}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{t('whyTitle')}</h2>
          <p className="mt-4 max-w-3xl text-lg text-slate-600">{t('whyDesc')}</p>
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

      <section id="compare" className="border-t border-slate-200 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t('compareTitle')}</h2>
          <p className="mt-3 max-w-2xl text-slate-600">{t('compareDesc')}</p>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 font-semibold text-slate-500">{t('compareColFeature')}</th>
                  <th className="px-4 py-3 font-bold text-indigo-700">{t('compareColInvoiceFlow')}</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">{t('compareColInvoiceFly')}</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">{t('compareColWave')}</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">{t('compareColFreshbooks')}</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">{t('compareColInvoiceSimple')}</th>
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
          <p className="mt-4 text-xs text-slate-500">{t('compareFootnote')}</p>
        </div>
      </section>

      <section id="features" className="border-t border-slate-200 bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t('featuresTitle')}</h2>
          <p className="mt-3 max-w-2xl text-slate-600">{t('featuresDesc')}</p>
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

      <section className="border-t border-slate-200 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-8 text-white md:p-12">
            <h2 className="text-3xl font-bold md:text-4xl">{t('whoTitle')}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {whoColumns.map((col) => (
                <div key={col.title} className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-bold">{col.title}</h3>
                  <ul className="mt-4 space-y-2 text-sm text-indigo-100">
                    {col.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span>{col.check ? '✓' : '—'}</span>
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

      <section id="pricing" className="border-t border-slate-200 bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t('pricingTitle')}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">{t('pricingDesc')}</p>
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
                    <span className="text-base font-medium text-slate-500">{t('perMonth')}</span>
                  )}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{plan.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="download" className="border-t border-slate-200 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t('downloadTitle')}</h2>
          <p className="mt-4 text-lg text-slate-600">{t('downloadDesc')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/app/register" className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 px-6 py-4 text-left shadow-sm hover:border-indigo-400">
              <p className="text-xs font-semibold uppercase text-indigo-600">{t('downloadWebApp')}</p>
              <p className="font-bold text-slate-900">invoiceflow-admin.onrender.com</p>
              <p className="text-sm text-indigo-600">{t('webAppCta')} →</p>
            </Link>
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-left shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">{t('downloadIOS')}</p>
              <p className="font-bold text-slate-900">{t('downloadAppStore')}</p>
              <p className="text-sm text-slate-500">{t('downloadComing')}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-left shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">{t('downloadAndroid')}</p>
              <p className="font-bold text-slate-900">{t('downloadGooglePlay')}</p>
              <p className="text-sm text-slate-500">{t('downloadComing')}</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            {t('downloadHaveAccount')}{' '}
            <Link href="/app/login" className="font-semibold text-indigo-600 hover:underline">
              {t('downloadSignIn')}
            </Link>
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
          <p>© {year} InvoiceFlow. {t('footerTagline')}</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <LanguageSelector />
            <Link href="/app" className="hover:text-indigo-600">{t('navWebApp')}</Link>
            <Link href="/admin" className="hover:text-indigo-600">{t('footerAdmin')}</Link>
            <Link href="/privacy" className="hover:text-indigo-600">{t('footerPrivacy')}</Link>
            <Link href="/terms" className="hover:text-indigo-600">{t('footerTerms')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
