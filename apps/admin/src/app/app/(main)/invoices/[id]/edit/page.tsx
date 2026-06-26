'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { InvoiceForm } from '@/components/app/InvoiceForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { invoicesApi } from '@/lib/appApi';
import { formToPayload } from '@/lib/invoicePayload';
import { useAuth } from '@/contexts/AuthContext';
import { useAppLocale } from '@/lib/i18n/AppLocaleContext';

export default function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useAppLocale();
  const [initial, setInitial] = useState<Parameters<typeof InvoiceForm>[0]['initial']>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoicesApi.get(id).then((inv) => {
      setInitial({
        clientId: inv.clientId,
        documentType: inv.documentType,
        dueDate: inv.dueDate?.slice(0, 10) || '',
        notes: inv.notes || '',
        terms: inv.terms || '',
        templateId: inv.templateId || 'modern',
        depositPercent: inv.depositPercent?.toString() || '',
        depositAmount: inv.depositAmount?.toString() || '',
        lineItems: inv.lineItems?.length
          ? inv.lineItems
          : [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }],
      });
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-sm text-slate-500">{t('loading')}</p>;

  return (
    <>
      <PageHeader title={t('editInvoiceTitle')} backHref={`/app/invoices/${id}`} />
      <InvoiceForm
        invoiceId={id}
        initial={initial}
        submitLabel={t('updateInvoiceBtn')}
        onSubmit={async (form) => {
          await invoicesApi.update(id, formToPayload(form, user?.currency || 'USD'));
          router.push(`/app/invoices/${id}`);
        }}
      />
    </>
  );
}
