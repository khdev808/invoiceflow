'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Check,
  Clock,
  Cloud,
  CreditCard,
  FileText,
  Gem,
  Gift,
  Globe,
  Minus,
  PenLine,
  Repeat,
  Target,
  Wallet,
  Wifi,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import type { TranslationKey } from '@/lib/i18n/en';

const DIFF_KEYS = [1, 2, 3, 4, 5, 6] as const;
const REASON_KEYS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const REASON_ICONS: LucideIcon[] = [Zap, Gift, Gem, CreditCard, PenLine, Globe, Cloud, Target];
const COMPARE_ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const FEATURE_KEYS = [1, 2, 3, 4, 5, 6] as const;
const FEATURE_ICONS: LucideIcon[] = [FileText, Wallet, Clock, PenLine, Repeat, Wifi];

function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--if-accent-soft)] text-[var(--if-accent-dark)]">
      <Icon className="h-5 w-5" strokeWidth={2} />
    </div>
  );
}

export function LandingPage() {
  const { t } = useLocale();

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
    {
      name: t('planProName'),
      price: '$9.99',
      detail: t('planProDetail'),
      highlight: true,
      badge: t('planProBadge'),
    },
    {
      name: t('planBusinessName'),
      price: '$19.99',
      detail: t('planBusinessDetail'),
      highlight: false,
      badge: null,
    },
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
    <MarketingShell>
      <section className="px-6 pb-20 pt-16 md:pt-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="mb-4 inline-flex rounded-full bg-[var(--if-accent-soft)] px-3 py-1 text-sm font-semibold text-[var(--if-accent-dark)]">
              {t('heroBadge')}
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-[var(--if-text)] md:text-6xl md:leading-[1.08]">
              {t('heroTitle1')}{' '}
              <span className="text-[var(--if-accent-dark)]">{t('heroTitle2')}</span>{' '}
              {t('heroTitle3')}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--if-muted)]">{t('heroDesc1')}</p>
            <p className="mt-4 max-w-2xl text-base font-semibold text-[var(--if-text)]">{t('heroDesc2')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/app/register" className="if-btn-primary px-6 py-3 text-base">
                {t('ctaStartFree')}
              </Link>
              <Link href="/app" className="if-btn-secondary px-6 py-3 text-base">
                {t('ctaWebApp')}
              </Link>
              <a href="#compare" className="if-btn-secondary px-6 py-3 text-base">
                {t('ctaCompare')}
              </a>
            </div>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="if-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--if-accent-dark)]">
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-[var(--if-text)]">{item.value}</p>
                <p className="text-sm text-[var(--if-muted)]">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reasons" className="border-t border-[var(--if-border)] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--if-accent-dark)]">
            {t('reasonsLabel')}
          </p>
          <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {t('reasonsTitle')}
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-[var(--if-muted)]">{t('reasonsDesc')}</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((r) => (
              <div key={r.title} className="if-card p-6">
                <IconTile icon={r.icon} />
                <h3 className="text-lg font-bold text-[var(--if-text)]">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--if-muted)]">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--if-border)] px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="if-card flex flex-col items-center justify-between gap-6 p-8 md:flex-row md:p-12">
            <div className="max-w-xl text-center md:text-left">
              <h2 className="font-display text-2xl font-semibold md:text-3xl">{t('webAppTitle')}</h2>
              <p className="mt-3 text-[var(--if-muted)]">{t('webAppDesc')}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/app" className="if-btn-primary px-6 py-3">
                {t('webAppCta')}
              </Link>
              <Link href="/app/register" className="if-btn-secondary px-6 py-3">
                {t('webAppRegister')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="why" className="border-t border-[var(--if-border)] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--if-accent-dark)]">
            {t('whyLabel')}
          </p>
          <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {t('whyTitle')}
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-[var(--if-muted)]">{t('whyDesc')}</p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {differentiators.map((d) => (
              <div key={d.headline} className="if-card p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--if-accent-dark)]">
                  {d.vs}
                </p>
                <h3 className="mt-2 text-xl font-bold text-[var(--if-text)]">{d.headline}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--if-muted)]">{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="compare" className="border-t border-[var(--if-border)] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            {t('compareTitle')}
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--if-muted)]">{t('compareDesc')}</p>
          <div className="if-card mt-8 overflow-x-auto p-0">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--if-border)] bg-[var(--if-accent-soft)]/40">
                  <th className="px-4 py-3 font-semibold text-[var(--if-muted)]">{t('compareColFeature')}</th>
                  <th className="px-4 py-3 font-bold text-[var(--if-accent-dark)]">
                    {t('compareColInvoiceFlow')}
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--if-muted)]">
                    {t('compareColInvoiceFly')}
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--if-muted)]">{t('compareColWave')}</th>
                  <th className="px-4 py-3 font-semibold text-[var(--if-muted)]">
                    {t('compareColFreshbooks')}
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--if-muted)]">
                    {t('compareColInvoiceSimple')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row) => (
                  <tr key={row.feature} className="border-b border-[var(--if-border)] last:border-0">
                    <td className="px-4 py-3 font-medium text-[var(--if-text)]">{row.feature}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--if-accent-dark)]">
                      {row.invoiceflow}
                    </td>
                    <td className="px-4 py-3 text-[var(--if-muted)]">{row.invoiceFly}</td>
                    <td className="px-4 py-3 text-[var(--if-muted)]">{row.wave}</td>
                    <td className="px-4 py-3 text-[var(--if-muted)]">{row.freshbooks}</td>
                    <td className="px-4 py-3 text-[var(--if-muted)]">{row.invoiceSimple}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-[var(--if-muted)]">{t('compareFootnote')}</p>
        </div>
      </section>

      <section id="features" className="border-t border-[var(--if-border)] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            {t('featuresTitle')}
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--if-muted)]">{t('featuresDesc')}</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="if-card p-6">
                <IconTile icon={feature.icon} />
                <h3 className="text-lg font-bold text-[var(--if-text)]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--if-muted)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--if-border)] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="if-card p-8 md:p-12">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">{t('whoTitle')}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {whoColumns.map((col) => (
                <div
                  key={col.title}
                  className="rounded-xl border border-[var(--if-border)] bg-[var(--if-bg)] p-6"
                >
                  <h3 className="text-lg font-bold text-[var(--if-text)]">{col.title}</h3>
                  <ul className="mt-4 space-y-2 text-sm text-[var(--if-muted)]">
                    {col.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        {col.check ? (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--if-success)]" strokeWidth={2.5} />
                        ) : (
                          <Minus className="mt-0.5 h-4 w-4 shrink-0 text-[var(--if-muted)]" strokeWidth={2.5} />
                        )}
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

      <section id="pricing" className="border-t border-[var(--if-border)] px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            {t('pricingTitle')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[var(--if-muted)]">{t('pricingDesc')}</p>
          <div className="mt-10 grid gap-6 text-left md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`if-card relative p-6 ${
                  plan.highlight ? 'ring-2 ring-[var(--if-accent)] ring-offset-2 ring-offset-[var(--if-bg)]' : ''
                }`}
              >
                {plan.badge ? (
                  <span className="absolute -top-3 left-6 rounded-full bg-[var(--if-accent)] px-3 py-0.5 text-xs font-bold text-white">
                    {plan.badge}
                  </span>
                ) : null}
                <p className="text-sm font-semibold uppercase tracking-wide text-[var(--if-muted)]">
                  {plan.name}
                </p>
                <p className="mt-2 text-4xl font-extrabold text-[var(--if-text)]">
                  {plan.price}
                  {plan.price !== '$0' && (
                    <span className="text-base font-medium text-[var(--if-muted)]">{t('perMonth')}</span>
                  )}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--if-muted)]">{plan.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="download" className="border-t border-[var(--if-border)] px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            {t('downloadTitle')}
          </h2>
          <p className="mt-4 text-lg text-[var(--if-muted)]">{t('downloadDesc')}</p>

          <div className="if-card mx-auto mt-10 overflow-hidden p-0">
            <Image
              src="/og/default.png"
              alt="InvoiceFlow product preview"
              width={1200}
              height={630}
              className="h-auto w-full"
              priority={false}
            />
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/app/register"
              className="if-card block px-6 py-4 text-left transition-colors hover:border-[var(--if-accent)]"
            >
              <p className="text-xs font-semibold uppercase text-[var(--if-accent-dark)]">
                {t('downloadWebApp')}
              </p>
              <p className="font-bold text-[var(--if-text)]">invoiceflow-admin.onrender.com</p>
              <p className="text-sm text-[var(--if-accent-dark)]">{t('webAppCta')}</p>
            </Link>
            <div className="if-card px-6 py-4 text-left">
              <p className="text-xs font-semibold uppercase text-[var(--if-muted)]">{t('downloadIOS')}</p>
              <p className="font-bold text-[var(--if-text)]">{t('downloadAppStore')}</p>
              <p className="text-sm text-[var(--if-muted)]">{t('downloadComing')}</p>
            </div>
            <div className="if-card px-6 py-4 text-left">
              <p className="text-xs font-semibold uppercase text-[var(--if-muted)]">{t('downloadAndroid')}</p>
              <p className="font-bold text-[var(--if-text)]">{t('downloadGooglePlay')}</p>
              <p className="text-sm text-[var(--if-muted)]">{t('downloadComing')}</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-[var(--if-muted)]">
            {t('downloadHaveAccount')}{' '}
            <Link href="/app/login" className="font-semibold text-[var(--if-accent-dark)] hover:underline">
              {t('downloadSignIn')}
            </Link>
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
