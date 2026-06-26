'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { AppLocaleProvider } from '@/lib/i18n/AppLocaleContext';

export default function AppRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppLocaleProvider>{children}</AppLocaleProvider>
    </AuthProvider>
  );
}
