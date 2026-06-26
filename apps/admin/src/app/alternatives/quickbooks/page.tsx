import { AlternativePage } from '@/components/AlternativePage';

export const metadata = {
  title: 'QuickBooks Alternative — Simple Invoicing | InvoiceFlow',
  description: 'Need invoicing without QuickBooks complexity? InvoiceFlow is built for freelancers who want to send invoices and get paid in minutes.',
};

export default function QuickBooksAlternativePage() {
  return (
    <AlternativePage
      competitor="QuickBooks"
      title="QuickBooks alternative for solo invoicing"
      subtitle="QuickBooks is powerful accounting software — but overkill when you just need professional invoices and fast payments."
      bullets={[
        '60-second invoice creation on web and mobile',
        'Client portal with Apple Pay, Google Pay, Stripe, and PayPal',
        'Free tier: 25 invoices/month — no accounting subscription required',
        'Receipt OCR, mileage, and time tracking included on Pro',
        'Export to QuickBooks CSV when your accountant needs it',
      ]}
    />
  );
}
