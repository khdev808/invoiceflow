import { AlternativePage } from '@/components/AlternativePage';

export const metadata = {
  title: 'HoneyBook Alternative — Client Invoicing | InvoiceFlow',
  description: 'InvoiceFlow vs HoneyBook for creatives who need fast invoicing without CRM overhead.',
};

export default function HoneyBookAlternativePage() {
  return (
    <AlternativePage
      competitor="HoneyBook"
      title="HoneyBook alternative focused on getting paid"
      subtitle="HoneyBook is a client management suite. InvoiceFlow is laser-focused on invoices, estimates, and payments."
      bullets={[
        'No steep learning curve — invoice in 60 seconds',
        'Estimates convert to invoices in one tap',
        'Client portal with e-signatures and online pay',
        'Free plan for side hustles; Pro at $9.99/month',
        'Works globally with multi-currency support',
      ]}
    />
  );
}
