import type { CreateInvoicePayload } from './appApi';
import type { InvoiceFormValues } from '@/components/app/InvoiceForm';

export function formToPayload(form: InvoiceFormValues, currency: string): CreateInvoicePayload {
  return {
    clientId: form.clientId,
    documentType: form.documentType,
    dueDate: form.documentType === 'INVOICE' ? form.dueDate : undefined,
    currency,
    notes: form.notes,
    terms: form.terms,
    templateId: form.templateId,
    depositPercent: form.depositPercent ? Number(form.depositPercent) : undefined,
    depositAmount: form.depositAmount ? Number(form.depositAmount) : undefined,
    recurringRule: form.recurringRule || undefined,
    linkedInvoiceId: form.linkedInvoiceId || undefined,
    lineItems: form.lineItems.filter((l) => l.description.trim()),
  };
}
