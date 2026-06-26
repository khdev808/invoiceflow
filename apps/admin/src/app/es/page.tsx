'use client';

import { useEffect } from 'react';
import { LocaleProvider, useLocale } from '@/lib/i18n/LocaleContext';
import { LandingPage } from '@/components/LandingPage';

function SpanishLanding() {
  const { setLang, ready } = useLocale();
  useEffect(() => {
    if (ready) setLang('es');
  }, [ready, setLang]);
  return <LandingPage />;
}

export default function EsHomePage() {
  return (
    <LocaleProvider>
      <SpanishLanding />
    </LocaleProvider>
  );
}
