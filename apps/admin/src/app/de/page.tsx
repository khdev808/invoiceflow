'use client';

import { useEffect } from 'react';
import { LocaleProvider, useLocale } from '@/lib/i18n/LocaleContext';
import { LandingPage } from '@/components/LandingPage';

function GermanLanding() {
  const { setLang, ready } = useLocale();
  useEffect(() => {
    if (ready) setLang('de');
  }, [ready, setLang]);
  return <LandingPage />;
}

export default function DeHomePage() {
  return (
    <LocaleProvider>
      <GermanLanding />
    </LocaleProvider>
  );
}
