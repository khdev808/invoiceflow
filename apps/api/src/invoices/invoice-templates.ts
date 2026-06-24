const TEMPLATE_COLORS: Record<string, { primary: string; accent: string }> = {
  modern: { primary: '#2563EB', accent: '#3B82F6' },
  classic: { primary: '#1E293B', accent: '#475569' },
  minimal: { primary: '#64748B', accent: '#94A3B8' },
  bold: { primary: '#7C3AED', accent: '#A78BFA' },
  professional: { primary: '#0F766E', accent: '#14B8A6' },
  creative: { primary: '#DB2777', accent: '#F472B6' },
};

export function getTemplateColors(templateId?: string | null) {
  return TEMPLATE_COLORS[templateId || 'modern'] || TEMPLATE_COLORS.modern;
}

export function buildInvoiceHtml(invoice: {
  documentType: string;
  documentNumber: string;
  issueDate: string | Date;
  dueDate?: string | Date | null;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  depositPercent?: number | null;
  notes?: string | null;
  templateId?: string | null;
  client: { name: string; email?: string | null; company?: string | null };
  lineItems: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  user?: { businessName?: string | null; name?: string | null } | null;
}) {
  const { primary, accent } = getTemplateColors(invoice.templateId);
  const biz = invoice.user?.businessName || invoice.user?.name || 'InvoiceFlow';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; color: #0F172A; }
  .header { background: ${primary}; color: #fff; padding: 32px 40px; }
  .header h1 { margin: 0; font-size: 28px; }
  .header p { margin: 8px 0 0; opacity: 0.85; }
  .content { padding: 32px 40px; }
  table { width: 100%; border-collapse: collapse; margin: 24px 0; }
  th { text-align: left; padding: 10px 8px; border-bottom: 2px solid ${accent}; color: #64748B; font-size: 12px; text-transform: uppercase; }
  td { padding: 12px 8px; border-bottom: 1px solid #E2E8F0; }
  .totals { text-align: right; margin-top: 16px; }
  .total-line { padding: 4px 0; }
  .grand { font-size: 24px; font-weight: 800; color: ${primary}; margin-top: 8px; }
</style></head><body>
  <div class="header">
    <p style="text-transform:uppercase;font-size:12px;letter-spacing:1px">${invoice.documentType}</p>
    <h1>${invoice.documentNumber}</h1>
    <p>${biz}</p>
  </div>
  <div class="content">
    <div style="display:flex;justify-content:space-between;margin-bottom:24px">
      <div><strong>Bill To</strong><br>${invoice.client.name}${invoice.client.company ? `<br>${invoice.client.company}` : ''}${invoice.client.email ? `<br>${invoice.client.email}` : ''}</div>
      <div style="text-align:right"><strong>Issue Date</strong><br>${new Date(invoice.issueDate).toLocaleDateString()}${invoice.dueDate ? `<br><br><strong>Due</strong><br>${new Date(invoice.dueDate).toLocaleDateString()}` : ''}</div>
    </div>
    <table>
      <thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>
        ${invoice.lineItems.map((i) => `<tr><td>${i.description}</td><td style="text-align:center">${i.quantity}</td><td style="text-align:right">$${i.unitPrice.toFixed(2)}</td><td style="text-align:right">$${i.total.toFixed(2)}</td></tr>`).join('')}
      </tbody>
    </table>
    <div class="totals">
      <div class="total-line">Subtotal: $${invoice.subtotal.toFixed(2)}</div>
      ${invoice.discountTotal > 0 ? `<div class="total-line">Discount: -$${invoice.discountTotal.toFixed(2)}</div>` : ''}
      ${invoice.taxTotal > 0 ? `<div class="total-line">Tax: $${invoice.taxTotal.toFixed(2)}</div>` : ''}
      ${invoice.depositPercent ? `<div class="total-line">Deposit (${invoice.depositPercent}%): $${(invoice.total * invoice.depositPercent / 100).toFixed(2)}</div>` : ''}
      <div class="grand">Total: $${invoice.total.toFixed(2)}</div>
    </div>
    ${invoice.notes ? `<p style="margin-top:32px;color:#64748B"><strong>Notes</strong><br>${invoice.notes}</p>` : ''}
  </div>
</body></html>`;
}
