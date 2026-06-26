'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAppLocale, appLanguages } from '@/lib/i18n/AppLocaleContext';
import { useEffect, useState } from 'react';
import { notificationsApi } from '@/lib/appApi';
import type { AppTranslationKey } from '@/lib/i18n/app/en';

function NavItem({ href, labelKey, icon, exact, badge, unread, onNavigate, isActive, t }: {
  href: string; labelKey: AppTranslationKey; icon: string; exact?: boolean; badge?: boolean;
  unread: number; onNavigate: () => void; isActive: boolean; t: (k: AppTranslationKey) => string;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
        isActive ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200/50' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <span className="text-base opacity-80">{icon}</span>
      <span className="flex-1">{t(labelKey)}</span>
      {badge && unread > 0 ? (
        <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>
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

  const navSections = [
    { label: 'Overview', items: [
      { href: '/app', labelKey: 'dashboard' as const, icon: '◆', exact: true },
      { href: '/app/notifications', labelKey: 'notifications' as const, icon: '◇', badge: true },
    ]},
    { label: 'Sales', items: [
      { href: '/app/invoices', labelKey: 'invoices' as const, icon: '▣' },
      { href: '/app/clients', labelKey: 'clients' as const, icon: '◎' },
      { href: '/app/recurring', labelKey: 'recurring' as const, icon: '↻' },
    ]},
    { label: 'Work', items: [
      { href: '/app/time', labelKey: 'time' as const, icon: '◷' },
      { href: '/app/expenses', labelKey: 'expenses' as const, icon: '▤' },
      { href: '/app/mileage', labelKey: 'mileage' as const, icon: '◉' },
      { href: '/app/products', labelKey: 'products' as const, icon: '▦' },
    ]},
    { label: 'Insights', items: [
      { href: '/app/reports', labelKey: 'reports' as const, icon: '▲' },
      { href: '/app/settings', labelKey: 'settings' as const, icon: '⚙' },
      { href: '/help', labelKey: 'help' as const, icon: '?' },
    ]},
  ];

  useEffect(() => {
    notificationsApi.unreadCount().then(setUnread).catch(() => {});
  }, [pathname]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex min-h-screen bg-[#F6F8FC] text-slate-900">
      {mobileOpen ? (
        <button type="button" className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu" />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[17.5rem] flex-col border-r border-slate-200/80 bg-white/95 backdrop-blur-xl transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 text-sm font-extrabold text-white shadow-lg shadow-indigo-300/40">
              IF
            </div>
            <div>
              <p className="font-bold tracking-tight">InvoiceFlow</p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-indigo-500">Web App</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto p-4">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">{section.label}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    labelKey={item.labelKey}
                    icon={item.icon}
                    exact={'exact' in item ? item.exact : false}
                    badge={'badge' in item ? item.badge : false}
                    unread={unread}
                    onNavigate={() => setMobileOpen(false)}
                    isActive={isActive(item.href, 'exact' in item ? item.exact : false)}
                    t={t}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('language')}</label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="mb-3 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          >
            {appLanguages.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.businessName || user?.email}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-indigo-600">{user?.plan || 'free'} plan</p>
          </div>
          <div className="mt-3 flex gap-3 px-1 text-xs font-medium">
            <Link href="/" className="text-indigo-600 hover:underline">{t('home')}</Link>
            <button type="button" onClick={logout} className="text-slate-500 hover:text-slate-800">{t('signOut')}</button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-md lg:hidden">
          <button type="button" onClick={() => setMobileOpen(true)} className="if-btn-secondary py-1.5 text-xs">Menu</button>
          <span className="font-bold">InvoiceFlow</span>
          <Link href="/app/invoices/new" className="text-sm font-bold text-indigo-600">+ {t('newInvoice')}</Link>
        </header>
        <main className="flex-1 p-4 md:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
