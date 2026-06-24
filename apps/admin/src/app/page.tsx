import { LocaleProvider } from '@/lib/i18n/LocaleContext';
import { LandingPage } from '@/components/LandingPage';

export default function Page() {
  return (
    <LocaleProvider>
      <LandingPage />
    </LocaleProvider>
  );
}
