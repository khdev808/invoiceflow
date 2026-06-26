import { AlternativePage } from '@/components/AlternativePage';

export const metadata = {
  title: 'Zoho Invoice Alternative | InvoiceFlow',
  description: 'Zoho Invoice alternative that is faster to learn and cheaper for freelancers and small teams.',
};

export default function ZohoAlternativePage() {
  return (
    <AlternativePage
      competitor="Zoho Invoice"
      title="Zoho Invoice alternative — simpler and solo-first"
      subtitle="Zoho is powerful but heavy. InvoiceFlow focuses on one job: invoice and get paid."
      bullets={[
        'Under 60-second invoice creation with templates',
        'Web + iOS + Android with offline mobile',
        'Webhooks and QuickBooks export on Business tier',
        '31-language landing + growing in-app localization',
        'Security: Turnstile, rate limits, admin isolation',
      ]}
    />
  );
}
