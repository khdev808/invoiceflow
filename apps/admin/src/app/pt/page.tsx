'use client';

import { useEffect } from 'react';
import { LocaleProvider, useLocale } from '@/lib/i18n/LocaleContext';
import { LandingPage } from '@/components/LandingPage';

function PortugueseLanding() {
  const { setLang, ready } = useLocale();
  useEffect(() => {
    if (ready) setLang('pt');
  }, [ready, setLang]);
  return <LandingPage />;
}

export default function PtHomePage() {
  return (
    <LocaleProvider>
      <PortugueseLanding />
    </LocaleProvider>
  );
}
