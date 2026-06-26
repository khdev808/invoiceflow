export function buildInvoiceEmailHtml(params: {
  clientName: string;
  documentNumber: string;
  documentType: string;
  total: number;
  currency: string;
  dueDate?: Date | string | null;
  portalUrl: string;
  businessName: string;
  accentColor?: string;
}) {
  const accent = params.accentColor || '#4F46E5';
  const due = params.dueDate
    ? new Date(params.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;
  const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: params.currency }).format(params.total);
  const docLabel = params.documentType === 'ESTIMATE' ? 'estimate' : params.documentType === 'CREDIT_NOTE' ? 'credit note' : 'invoice';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08)">
        <tr><td style="background:${accent};padding:28px 32px;color:#ffffff">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;opacity:0.85">Your ${docLabel} is ready</p>
          <h1 style="margin:8px 0 0;font-size:26px;font-weight:800">${params.documentNumber}</h1>
          <p style="margin:8px 0 0;font-size:15px;opacity:0.9">from ${params.businessName}</p>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 16px;font-size:16px;color:#334155">Hi ${params.clientName},</p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#475569">
            You have a new ${docLabel} for <strong style="color:#0F172A">${amount}</strong>${due ? ` due <strong>${due}</strong>` : ''}.
            A PDF copy is attached for your records.
          </p>
          <table cellpadding="0" cellspacing="0"><tr><td style="border-radius:12px;background:${accent}">
            <a href="${params.portalUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none">View &amp; Pay Online</a>
          </td></tr></table>
          <p style="margin:24px 0 0;font-size:13px;color:#94A3B8;line-height:1.5">
            Or copy this link: <a href="${params.portalUrl}" style="color:${accent}">${params.portalUrl}</a>
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;text-align:center">
          <p style="margin:0;font-size:12px;color:#94A3B8">Sent securely via InvoiceFlow</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
