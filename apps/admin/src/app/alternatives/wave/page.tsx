import { AlternativePage } from '@/components/AlternativePage';

export const metadata = {
  title: 'Wave Alternative — Free Invoice Maker | InvoiceFlow',
  description: 'Looking for a Wave alternative? InvoiceFlow offers faster mobile invoicing, client portal payments, and a generous free plan.',
};

export default function WaveAlternativePage() {
  return (
    <AlternativePage
      competitor="Wave"
      title="A faster Wave alternative for freelancers"
      subtitle="Wave is great for accounting, but many solo businesses just need to send an invoice and get paid — fast."
      bullets={[
        'Create and send invoices in under 60 seconds on web or mobile',
        'Client portal with Stripe & PayPal — clients pay without an app',
        'Free plan: 25 invoices/month, unlimited clients',
        'Receipt OCR, mileage, time tracking, and recurring invoices on Pro ($9.99)',
        'No surprise fees — clear pricing vs Wave add-ons',
      ]}
    />
  );
}
