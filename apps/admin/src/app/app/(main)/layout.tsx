'use client';

import { AppShell } from '@/components/app/AppShell';
import { AuthGuard } from '@/components/app/AuthGuard';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
