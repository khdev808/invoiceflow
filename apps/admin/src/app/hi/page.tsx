'use client';

import { useEffect } from 'react';
import { LocaleProvider, useLocale } from '@/lib/i18n/LocaleContext';
import { LandingPage } from '@/components/LandingPage';

function HindiLanding() {
  const { setLang, ready } = useLocale();
  useEffect(() => {
    if (ready) setLang('hi');
  }, [ready, setLang]);
  return <LandingPage />;
}

export default function HiHomePage() {
  return (
    <LocaleProvider>
      <HindiLanding />
    </LocaleProvider>
  );
}
