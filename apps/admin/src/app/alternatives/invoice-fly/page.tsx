import { AlternativePage } from '@/components/AlternativePage';

export const metadata = {
  title: 'Invoice Fly Alternative — InvoiceFlow',
  description: 'Compare Invoice Fly vs InvoiceFlow. Cheaper Pro plan, real free tier, and faster invoice creation.',
};

export default function InvoiceFlyAlternativePage() {
  return (
    <AlternativePage
      competitor="Invoice Fly"
      title="Invoice Fly alternative with a better free plan"
      subtitle="Stop paying weekly fees for basics. InvoiceFlow gives you a real free tier and Pro under $10/month."
      bullets={[
        'Free: 25 invoices/month — not a 3-day trial',
        'Pro $9.99/mo vs Invoice Fly weekly charges that add up fast',
        'Duplicate invoices, last-client shortcuts, keyboard save on web',
        'Branded PDF emails with payment links attached',
        'iOS + Android apps with offline create & sync',
      ]}
    />
  );
}
