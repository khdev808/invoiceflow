'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bell,
  Car,
  Clock,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Package,
  Receipt,
  RefreshCw,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppLocale, appLanguages } from '@/lib/i18n/AppLocaleContext';
import { useEffect, useState } from 'react';
import { notificationsApi } from '@/lib/appApi';
import type { AppTranslationKey } from '@/lib/i18n/app/en';
import { BrandLogo } from '@/components/marketing/BrandLogo';

function NavItem({
  href,
  labelKey,
  icon: Icon,
  exact,
  badge,
  unread,
  onNavigate,
  isActive,
  t,
}: {
  href: string;
  labelKey: AppTranslationKey;
  icon: LucideIcon;
  exact?: boolean;
  badge?: boolean;
  unread: number;
  onNavigate: () => void;
  isActive: boolean;
  t: (k: AppTranslationKey) => string;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
        isActive
          ? 'bg-[var(--if-accent)] text-white'
          : 'text-[var(--if-muted)] hover:bg-[var(--if-accent-soft)] hover:text-[var(--if-text)]'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} />
      <span className="flex-1">{t(labelKey)}</span>
      {badge && unread > 0 ? (
        <span className="rounded-full bg-[var(--if-danger)] px-1.5 py-0.5 text-[10px] font-bold text-white">
          {unread > 9 ? '9+' : unread}
        </span>
      ) : null}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useAppLocale();
  const [unread, setUnread] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navSections: {
    label: string;
    items: {
      href: string;
      labelKey: AppTranslationKey;
      icon: LucideIcon;
      exact?: boolean;
      badge?: boolean;
    }[];
  }[] = [
    {
      label: 'Overview',
      items: [
        { href: '/app', labelKey: 'dashboard', icon: LayoutDashboard, exact: true },
        { href: '/app/notifications', labelKey: 'notifications', icon: Bell, badge: true },
      ],
    },
    {
      label: 'Sales',
      items: [
        { href: '/app/invoices', labelKey: 'invoices', icon: FileText },
        { href: '/app/clients', labelKey: 'clients', icon: Users },
        { href: '/app/recurring', labelKey: 'recurring', icon: RefreshCw },
      ],
    },
    {
      label: 'Work',
      items: [
        { href: '/app/time', labelKey: 'time', icon: Clock },
        { href: '/app/expenses', labelKey: 'expenses', icon: Receipt },
        { href: '/app/mileage', labelKey: 'mileage', icon: Car },
        { href: '/app/products', labelKey: 'products', icon: Package },
      ],
    },
    {
      label: 'Insights',
      items: [
        { href: '/app/reports', labelKey: 'reports', icon: BarChart3 },
        { href: '/app/settings', labelKey: 'settings', icon: Settings },
        { href: '/help', labelKey: 'help', icon: HelpCircle },
      ],
    },
  ];

  useEffect(() => {
    notificationsApi.unreadCount().then(setUnread).catch(() => {});
  }, [pathname]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex min-h-screen bg-[var(--if-bg)] text-[var(--if-text)]">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[17.5rem] flex-col border-r border-[var(--if-border)] bg-[var(--if-surface)] transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-[var(--if-border)] px-5 py-5">
          <BrandLogo size="sm" href="/app" />
          <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-[var(--if-muted)]">
            Web App
          </p>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto p-4">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--if-muted)]">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    labelKey={item.labelKey}
                    icon={item.icon}
                    exact={item.exact}
                    badge={item.badge}
                    unread={unread}
                    onNavigate={() => setMobileOpen(false)}
                    isActive={isActive(item.href, item.exact)}
                    t={t}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[var(--if-border)] p-4">
          <label className="if-label mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--if-muted)]">
            {t('language')}
          </label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="if-input mb-3 py-1.5"
          >
            {appLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <div className="if-card p-3">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-[var(--if-muted)]">
              {user?.businessName || user?.email}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[var(--if-accent-dark)]">
              {user?.plan || 'free'} plan
            </p>
          </div>
          <div className="mt-3 flex gap-3 px-1 text-xs font-medium">
            <Link href="/" className="text-[var(--if-accent-dark)] hover:underline">
              {t('home')}
            </Link>
            <button
              type="button"
              onClick={logout}
              className="text-[var(--if-muted)] hover:text-[var(--if-text)]"
            >
              {t('signOut')}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--if-border)] bg-[var(--if-surface)] px-4 py-3 lg:hidden">
          <button type="button" onClick={() => setMobileOpen(true)} className="if-btn-secondary py-1.5 text-xs">
            Menu
          </button>
          <BrandLogo size="sm" href="/app" />
          <Link href="/app/invoices/new" className="text-sm font-bold text-[var(--if-accent-dark)]">
            + {t('newInvoice')}
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
