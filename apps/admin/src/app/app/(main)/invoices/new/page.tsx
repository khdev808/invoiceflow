'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { InvoiceForm } from '@/components/app/InvoiceForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { invoicesApi } from '@/lib/appApi';
import { formToPayload } from '@/lib/invoicePayload';
import { useAuth } from '@/contexts/AuthContext';

function NewInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const docType = searchParams.get('type') || 'INVOICE';
  const clientId = searchParams.get('clientId') || '';

  const label = docType === 'ESTIMATE' ? 'estimate' : docType === 'CREDIT_NOTE' ? 'credit note' : 'invoice';

  return (
    <>
      <PageHeader
        title={`New ${label}`}
        subtitle="Professional documents in under a minute"
        backHref="/app/invoices"
      />
      <InvoiceForm
        initial={{
          documentType: docType,
          clientId: clientId || undefined,
        }}
        submitLabel={`Save ${label}`}
        onSubmit={async (form) => {
          const inv = await invoicesApi.create(formToPayload(form, user?.currency || 'USD'));
          router.push(`/app/invoices/${inv.id}`);
        }}
      />
    </>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
      <NewInvoiceContent />
    </Suspense>
  );
}
