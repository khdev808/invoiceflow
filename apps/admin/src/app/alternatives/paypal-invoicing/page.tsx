import { AlternativePage } from '@/components/AlternativePage';

export const metadata = {
  title: 'PayPal Invoicing Alternative | InvoiceFlow',
  description: 'InvoiceFlow vs PayPal Invoicing — better templates, client portal, and mobile apps for freelancers.',
};

export default function PayPalAlternativePage() {
  return (
    <AlternativePage
      competitor="PayPal Invoicing"
      title="PayPal Invoicing alternative with a real client portal"
      subtitle="PayPal invoices work — but clients deserve a polished portal with multiple payment options."
      bullets={[
        'Beautiful invoice templates and PDF branding',
        'Portal accepts cards, wallets, and PayPal',
        'Track when clients open and pay invoices',
        'SMS and WhatsApp sharing from mobile',
        'Still integrate PayPal alongside Stripe',
      ]}
    />
  );
}
