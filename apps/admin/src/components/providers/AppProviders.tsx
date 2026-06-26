'use client';

import { useEffect } from 'react';
import { initAnalytics } from '@/lib/analytics';
import { initSentry } from '@/lib/sentry';

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initSentry();
    initAnalytics();
  }, []);

  return <>{children}</>;
}
