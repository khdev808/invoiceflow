import { buildInvoicePdfHtml, type InvoicePdfData } from './invoicePdf';
import type { Invoice } from './appApi';
import { showBranding } from './constants';

export function invoiceToPdfData(invoice: Invoice, userPlan?: string | null): InvoicePdfData {
  return {
    documentType: invoice.documentType,
    documentNumber: invoice.documentNumber,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    subtotal: invoice.subtotal,
    taxTotal: invoice.taxTotal,
    discountTotal: invoice.discountTotal || 0,
    total: invoice.total,
    lateFeeAmount: invoice.lateFeeAmount,
    depositPercent: invoice.depositPercent,
    depositAmount: invoice.depositAmount,
    depositPaid: invoice.depositPaid,
    currency: invoice.currency,
    notes: invoice.notes,
    terms: invoice.terms,
    templateId: invoice.templateId,
    signature: invoice.signature,
    clientSignature: invoice.clientSignature,
    client: {
      name: invoice.client?.name || 'Client',
      email: invoice.client?.email,
      company: invoice.client?.company,
      address: invoice.client?.address,
    },
    lineItems: (invoice.lineItems || []).map((l) => ({
      description: l.description,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      taxRate: l.taxRate,
      discount: l.discount,
      total: l.quantity * l.unitPrice,
    })),
    user: invoice.user
      ? {
          businessName: invoice.user.businessName,
          name: invoice.user.name,
          businessLogo: invoice.user.businessLogo,
          businessEmail: (invoice.user as { businessEmail?: string }).businessEmail,
          businessPhone: (invoice.user as { businessPhone?: string }).businessPhone,
        }
      : null,
    showBranding: showBranding(userPlan),
  } as InvoicePdfData & { showBranding?: boolean };
}

export function printInvoicePdf(invoice: Invoice, userPlan?: string | null) {
  const html = buildInvoicePdfHtml(invoiceToPdfData(invoice, userPlan) as InvoicePdfData);
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.onload = () => w.print();
}
