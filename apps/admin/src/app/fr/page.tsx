'use client';

import { useEffect } from 'react';
import { LocaleProvider, useLocale } from '@/lib/i18n/LocaleContext';
import { LandingPage } from '@/components/LandingPage';

function FrenchLanding() {
  const { setLang, ready } = useLocale();
  useEffect(() => {
    if (ready) setLang('fr');
  }, [ready, setLang]);
  return <LandingPage />;
}

export default function FrHomePage() {
  return (
    <LocaleProvider>
      <FrenchLanding />
    </LocaleProvider>
  );
}
