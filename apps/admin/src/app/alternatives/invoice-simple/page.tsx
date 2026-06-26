import { AlternativePage } from '@/components/AlternativePage';

export const metadata = {
  title: 'Invoice Simple Alternative | InvoiceFlow',
  description: 'Invoice Simple alternative with unlimited clients on free, portal payments, and no weekly subscription traps.',
};

export default function InvoiceSimpleAlternativePage() {
  return (
    <AlternativePage
      competitor="Invoice Simple"
      title="Invoice Simple alternative without weekly fees"
      subtitle="Get the same speed with transparent monthly pricing and a client payment portal included."
      bullets={[
        'Send invoices with PDF attachment and pay link in one click',
        'Track when clients open your invoice',
        'Estimates, credit notes, recurring invoices',
        'Receipt OCR on Pro — scan expenses in seconds',
        'Refer a friend: give Pro, get Pro',
      ]}
    />
  );
}
