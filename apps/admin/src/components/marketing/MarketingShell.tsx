'use client';

import Link from 'next/link';
import { LocaleProvider, useLocale } from '@/lib/i18n/LocaleContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { BrandLogo } from '@/components/marketing/BrandLogo';

type MarketingShellProps = {
  children: React.ReactNode;
};

function MarketingShellInner({ children }: MarketingShellProps) {
  const { t, isRtl } = useLocale();
  const year = new Date().getFullYear();

  return (
    <div
      className={`flex min-h-screen flex-col ${isRtl ? 'rtl' : 'ltr'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ background: 'var(--if-bg)', color: 'var(--if-text)' }}
    >
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{
          borderColor: 'var(--if-border)',
          background: 'color-mix(in srgb, var(--if-surface) 85%, transparent)',
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <BrandLogo size="md" priority />

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a
              href="#features"
              className="transition-colors hover:text-[var(--if-accent-dark)]"
              style={{ color: 'var(--if-muted)' }}
            >
              {t('navFeatures')}
            </a>
            <a
              href="#pricing"
              className="transition-colors hover:text-[var(--if-accent-dark)]"
              style={{ color: 'var(--if-muted)' }}
            >
              {t('navPricing')}
            </a>
            <Link
              href="/help"
              className="transition-colors hover:text-[var(--if-accent-dark)]"
              style={{ color: 'var(--if-muted)' }}
            >
              Help
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Link
              href="/app/login"
              className="hidden text-sm font-medium transition-colors hover:text-[var(--if-accent-dark)] sm:inline-block"
              style={{ color: 'var(--if-muted)' }}
            >
              {t('downloadSignIn')}
            </Link>
            <Link href="/app/register" className="if-btn-primary hidden sm:inline-flex">
              {t('navGetStarted')}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer
        className="border-t px-6 py-10"
        style={{ borderColor: 'var(--if-border)', background: 'var(--if-surface)' }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <BrandLogo size="sm" href="/" />

          <div
            className="flex flex-wrap items-center justify-center gap-6 text-sm"
            style={{ color: 'var(--if-muted)' }}
          >
            <Link href="/help" className="transition-colors hover:text-[var(--if-accent-dark)]">
              Help
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-[var(--if-accent-dark)]">
              {t('footerPrivacy')}
            </Link>
            <Link href="/terms" className="transition-colors hover:text-[var(--if-accent-dark)]">
              {t('footerTerms')}
            </Link>
          </div>

          <p className="text-sm" style={{ color: 'var(--if-muted)' }}>
            &copy; {year} InvoiceFlow
          </p>
        </div>
      </footer>
    </div>
  );
}

export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <LocaleProvider>
      <MarketingShellInner>{children}</MarketingShellInner>
    </LocaleProvider>
  );
}
