'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { InvoiceForm } from '@/components/app/InvoiceForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { invoicesApi } from '@/lib/appApi';
import { AnalyticsEvents, trackEvent } from '@/lib/analytics';
import { formToPayload } from '@/lib/invoicePayload';
import { useAuth } from '@/contexts/AuthContext';
import { useAppLocale } from '@/lib/i18n/AppLocaleContext';
import type { AppTranslationKey } from '@/lib/i18n/app/en';

function NewInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t } = useAppLocale();
  const docType = searchParams.get('type') || 'INVOICE';
  const clientId = searchParams.get('clientId') || '';

  const meta: Record<string, { title: AppTranslationKey; submit: AppTranslationKey }> = {
    INVOICE: { title: 'newInvoiceTitle', submit: 'saveInvoiceBtn' },
    ESTIMATE: { title: 'newEstimateTitle', submit: 'saveEstimateBtn' },
    CREDIT_NOTE: { title: 'newCreditNoteTitle', submit: 'saveCreditNoteBtn' },
  };
  const { title, submit } = meta[docType] || meta.INVOICE;

  return (
    <>
      <PageHeader
        title={t(title)}
        subtitle={t('newDocSubtitle')}
        backHref="/app/invoices"
      />
      <InvoiceForm
        initial={{
          documentType: docType,
          clientId: clientId || undefined,
        }}
        submitLabel={t(submit)}
        onSubmit={async (form) => {
          const inv = await invoicesApi.create(formToPayload(form, user?.currency || 'USD'));
          trackEvent(AnalyticsEvents.INVOICE_CREATED, {
            documentType: form.documentType,
            lineItemCount: form.lineItems.length,
          });
          router.push(`/app/invoices/${inv.id}`);
        }}
      />
    </>
  );
}

export default function NewInvoicePage() {
  const { t } = useAppLocale();
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">{t('loading')}</p>}>
      <NewInvoiceContent />
    </Suspense>
  );
}
