'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { notificationsApi } from '@/lib/appApi';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { href: '/app', label: 'Dashboard', icon: '◆', exact: true },
      { href: '/app/notifications', label: 'Notifications', icon: '◇', badge: true },
    ],
  },
  {
    label: 'Sales',
    items: [
      { href: '/app/invoices', label: 'Invoices', icon: '▣' },
      { href: '/app/clients', label: 'Clients', icon: '◎' },
      { href: '/app/recurring', label: 'Recurring', icon: '↻' },
    ],
  },
  {
    label: 'Work',
    items: [
      { href: '/app/time', label: 'Time', icon: '◷' },
      { href: '/app/expenses', label: 'Expenses', icon: '▤' },
      { href: '/app/mileage', label: 'Mileage', icon: '◉' },
      { href: '/app/products', label: 'Products', icon: '▦' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/app/reports', label: 'Reports', icon: '▲' },
      { href: '/app/settings', label: 'Settings', icon: '⚙' },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

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
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">{section.label}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive(item.href, 'exact' in item ? item.exact : false)
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200/50'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="text-base opacity-80">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {'badge' in item && item.badge && unread > 0 ? (
                      <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.businessName || user?.email}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-indigo-600">{user?.plan || 'free'} plan</p>
          </div>
          <div className="mt-3 flex gap-3 px-1 text-xs font-medium">
            <Link href="/" className="text-indigo-600 hover:underline">Home</Link>
            <button type="button" onClick={logout} className="text-slate-500 hover:text-slate-800">Sign out</button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-md lg:hidden">
          <button type="button" onClick={() => setMobileOpen(true)} className="if-btn-secondary py-1.5 text-xs">Menu</button>
          <span className="font-bold">InvoiceFlow</span>
          <Link href="/app/invoices/new" className="text-sm font-bold text-indigo-600">+ New</Link>
        </header>
        <main className="flex-1 p-4 md:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
