import { AlternativePage } from '@/components/AlternativePage';

export const metadata = {
  title: 'Xero Alternative — Invoice & Get Paid | InvoiceFlow',
  description: 'Compare InvoiceFlow vs Xero for freelancers and small teams who prioritize invoicing speed over full accounting.',
};

export default function XeroAlternativePage() {
  return (
    <AlternativePage
      competitor="Xero"
      title="A lighter Xero alternative for invoicing"
      subtitle="Xero shines for bookkeeping teams. InvoiceFlow shines when you need to bill a client before lunch."
      bullets={[
        'Mobile-first workflow — create invoices from your phone',
        'Branded PDFs and emails with delivery tracking',
        'Recurring invoices and automated payment reminders',
        'Transparent pricing from free to $9.99/mo Pro',
        'QuickBooks CSV export for your bookkeeper',
      ]}
    />
  );
}
