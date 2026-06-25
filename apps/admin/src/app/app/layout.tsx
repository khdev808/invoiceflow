'use client';

import { AuthProvider } from '@/contexts/AuthContext';

export default function AppRootLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
