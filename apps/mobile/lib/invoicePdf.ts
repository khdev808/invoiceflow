import { templates } from '@/constants/theme';

export function getTemplateColors(templateId?: string | null) {
  const t = templates.find((x) => x.id === templateId) || templates[0];
  return { primary: t.color, name: t.name };
}

export function buildInvoicePdfHtml(invoice: any) {
  const { primary } = getTemplateColors(invoice.templateId);
  const biz = invoice.user?.businessName || invoice.user?.name || 'InvoiceFlow';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { font-family: sans-serif; margin: 0; color: #0F172A; }
  .header { background: ${primary}; color: #fff; padding: 32px 40px; }
  .content { padding: 32px 40px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th, td { padding: 8px; border-bottom: 1px solid #E2E8F0; }
  th { text-align: left; color: #64748B; font-size: 12px; }
</style></head><body>
  <div class="header">
    <p style="margin:0;font-size:12px;text-transform:uppercase">${invoice.documentType}</p>
    <h1 style="margin:8px 0 0">${invoice.documentNumber}</h1>
    <p style="margin:8px 0 0;opacity:0.9">${biz}</p>
  </div>
  <div class="content">
    <p><strong>Bill To:</strong> ${invoice.client.name}</p>
    <p><strong>Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</p>
    <table>
      <tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr>
      ${invoice.lineItems.map((i: any) => `<tr><td>${i.description}</td><td>${i.quantity}</td><td>$${i.unitPrice}</td><td>$${i.total.toFixed(2)}</td></tr>`).join('')}
    </table>
    <p style="text-align:right;font-size:22px"><strong>Total: $${invoice.total.toFixed(2)}</strong></p>
  </div>
</body></html>`;
}
