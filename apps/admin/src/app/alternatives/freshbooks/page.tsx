import { AlternativePage } from '@/components/AlternativePage';

export const metadata = {
  title: 'FreshBooks Alternative for Solos | InvoiceFlow',
  description: 'Need a simpler FreshBooks alternative? InvoiceFlow is built for freelancers who want speed, not accounting complexity.',
};

export default function FreshBooksAlternativePage() {
  return (
    <AlternativePage
      competitor="FreshBooks"
      title="FreshBooks alternative for solo businesses"
      subtitle="You do not need full accounting software to send a professional invoice."
      bullets={[
        'Simpler UX — invoice to paid in one flow',
        'Lower cost: free tier + Pro at $9.99/month',
        'Client portal, deposits, partial payments, late fees',
        'QuickBooks CSV export for your bookkeeper',
        'Mobile-first with offline support',
      ]}
    />
  );
}
