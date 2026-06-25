'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { notificationsApi } from '@/lib/appApi';

const NAV = [
  { href: '/app', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/app/invoices', label: 'Invoices', icon: '📄' },
  { href: '/app/clients', label: 'Clients', icon: '👥' },
  { href: '/app/expenses', label: 'Expenses', icon: '🧾' },
  { href: '/app/time', label: 'Time', icon: '⏱️' },
  { href: '/app/products', label: 'Products', icon: '📦' },
  { href: '/app/reports', label: 'Reports', icon: '📈' },
  { href: '/app/notifications', label: 'Notifications', icon: '🔔' },
  { href: '/app/settings', label: 'Settings', icon: '⚙️' },
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
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white">
            IF
          </div>
          <div>
            <p className="font-bold tracking-tight">InvoiceFlow</p>
            <p className="text-xs text-slate-500">Web App</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive(item.href, item.exact)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.href === '/app/notifications' && unread > 0 ? (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <p className="truncate text-sm font-semibold">{user?.name}</p>
          <p className="truncate text-xs text-slate-500">{user?.businessName || user?.email}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/" className="text-xs font-medium text-indigo-600 hover:underline">
              Home
            </Link>
            <button type="button" onClick={logout} className="text-xs font-medium text-slate-500 hover:text-slate-800">
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium"
          >
            Menu
          </button>
          <span className="font-semibold">InvoiceFlow</span>
          <Link href="/app/invoices/new" className="text-sm font-semibold text-indigo-600">
            + New
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
