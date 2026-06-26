import { AlternativePage } from '@/components/AlternativePage';

export const metadata = {
  title: 'Harvest Alternative — Time & Invoicing | InvoiceFlow',
  description: 'Looking for a Harvest alternative? InvoiceFlow combines time tracking, expenses, and invoicing in one affordable app.',
};

export default function HarvestAlternativePage() {
  return (
    <AlternativePage
      competitor="Harvest"
      title="Harvest alternative for time-based billing"
      subtitle="Harvest popularized time tracking + invoicing. InvoiceFlow modernizes it with mobile OCR and wallet payments."
      bullets={[
        'Built-in time tracker converts hours to line items',
        'Expense and mileage tracking with receipt scan',
        'Recurring invoices for retainer clients',
        'Lower cost than Harvest for freelancers',
        'Native iOS and Android apps',
      ]}
    />
  );
}
