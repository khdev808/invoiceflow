import { templates, type InvoiceTemplate } from '@/constants/theme';

export type InvoicePdfData = {
  documentType: string;
  documentNumber: string;
  issueDate: string | Date;
  dueDate?: string | Date | null;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  lateFeeAmount?: number;
  depositPercent?: number | null;
  depositAmount?: number | null;
  depositPaid?: boolean;
  currency?: string;
  notes?: string | null;
  terms?: string | null;
  templateId?: string | null;
  signature?: string | null;
  clientSignature?: string | null;
  client: { name: string; email?: string | null; company?: string | null; address?: string | null };
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    discount?: number;
    total: number;
  }>;
  user?: {
    businessName?: string | null;
    name?: string | null;
    businessLogo?: string | null;
    businessEmail?: string | null;
    businessPhone?: string | null;
    businessAddress?: string | null;
    taxId?: string | null;
  } | null;
};

export function getTemplate(templateId?: string | null): InvoiceTemplate {
  return templates.find((x) => x.id === templateId) || templates[0];
}

function fmt(amount: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

function docLabel(type: string) {
  const map: Record<string, string> = {
    INVOICE: 'Invoice',
    ESTIMATE: 'Estimate',
    CREDIT_NOTE: 'Credit Note',
  };
  return map[type] || type;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function signatureBlock(sig: string | null | undefined, label: string) {
  if (!sig) return '';
  const isSvg = sig.startsWith('data:image/svg');
  const isDataUrl = sig.startsWith('data:');
  const content = isDataUrl
    ? `<img src="${sig}" alt="${label}" style="max-height:64px;max-width:200px" />`
    : `<p style="font-family:cursive;font-size:22px;margin:0">${escapeHtml(sig)}</p>`;
  return `<div style="margin-top:24px"><p style="font-size:11px;color:#64748B;text-transform:uppercase;margin:0 0 8px">${label}</p>${content}</div>`;
}

function lineItemsTable(invoice: InvoicePdfData, primary: string, accent: string) {
  const currency = invoice.currency || 'USD';
  return `
    <table>
      <thead><tr>
        <th>Description</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Rate</th>
        <th style="text-align:right">Tax</th>
        <th style="text-align:right">Total</th>
      </tr></thead>
      <tbody>
        ${invoice.lineItems.map((i) => `
          <tr>
            <td>${escapeHtml(i.description)}${i.discount ? `<br><small style="color:#94A3B8">Disc: ${fmt(i.discount, currency)}</small>` : ''}</td>
            <td style="text-align:center">${i.quantity}</td>
            <td style="text-align:right">${fmt(i.unitPrice, currency)}</td>
            <td style="text-align:right">${i.taxRate ? `${i.taxRate}%` : '—'}</td>
            <td style="text-align:right;font-weight:600">${fmt(i.total, currency)}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function totalsBlock(invoice: InvoicePdfData, primary: string) {
  const currency = invoice.currency || 'USD';
  const depositVal = invoice.depositAmount
    ?? (invoice.depositPercent ? (invoice.total * invoice.depositPercent) / 100 : 0);
  return `
    <div class="totals">
      <div class="total-line">Subtotal: ${fmt(invoice.subtotal, currency)}</div>
      ${invoice.discountTotal > 0 ? `<div class="total-line">Discount: −${fmt(invoice.discountTotal, currency)}</div>` : ''}
      ${invoice.taxTotal > 0 ? `<div class="total-line">Tax: ${fmt(invoice.taxTotal, currency)}</div>` : ''}
      ${invoice.lateFeeAmount && invoice.lateFeeAmount > 0 ? `<div class="total-line" style="color:#DC2626">Late fee: ${fmt(invoice.lateFeeAmount, currency)}</div>` : ''}
      ${depositVal > 0 ? `<div class="total-line">Deposit${invoice.depositPercent ? ` (${invoice.depositPercent}%)` : ''}: ${fmt(depositVal, currency)}${invoice.depositPaid ? ' ✓ Paid' : ''}</div>` : ''}
      <div class="grand">Total: ${fmt(invoice.total + (invoice.lateFeeAmount || 0), currency)}</div>
    </div>`;
}

function baseStyles(layout: string, primary: string, accent: string) {
  const font = layout === 'classic' ? 'Georgia, serif' : "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  return `
    body { font-family: ${font}; margin: 0; color: #0F172A; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { text-align: left; padding: 10px 8px; border-bottom: 2px solid ${accent}; color: #64748B; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 10px 8px; border-bottom: 1px solid #E2E8F0; vertical-align: top; }
    .totals { text-align: right; margin-top: 8px; }
    .total-line { padding: 3px 0; color: #475569; }
    .grand { font-size: 22px; font-weight: 800; color: ${primary}; margin-top: 10px; }
    .content { padding: 32px 40px; }
  `;
}

function renderModern(invoice: InvoicePdfData, tpl: InvoiceTemplate) {
  const biz = invoice.user?.businessName || invoice.user?.name || 'InvoiceFlow';
  const primary = tpl.color;
  const accent = tpl.accentColor;
  return `
    <div class="header" style="background:${primary};color:#fff;padding:32px 40px">
      ${invoice.user?.businessLogo ? `<img src="${invoice.user.businessLogo}" style="height:40px;margin-bottom:12px" />` : ''}
      <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;opacity:0.85">${docLabel(invoice.documentType)}</p>
      <h1 style="margin:8px 0 0;font-size:28px">${escapeHtml(invoice.documentNumber)}</h1>
      <p style="margin:8px 0 0;opacity:0.9">${escapeHtml(biz)}</p>
    </div>
    <div class="content">${billToBlock(invoice)}${lineItemsTable(invoice, primary, accent)}${totalsBlock(invoice, primary)}
      ${notesBlock(invoice)}${signatureBlock(invoice.signature, 'Authorized Signature')}${signatureBlock(invoice.clientSignature, 'Client Signature')}</div>`;
}

function renderClassic(invoice: InvoicePdfData, tpl: InvoiceTemplate) {
  const biz = invoice.user?.businessName || invoice.user?.name || 'InvoiceFlow';
  const primary = tpl.color;
  const accent = tpl.accentColor;
  return `
    <div style="border-bottom:4px double ${primary};padding:28px 40px 20px">
      <div style="display:flex;justify-content:space-between;align-items:flex-end">
        <div><h1 style="margin:0;font-size:26px;color:${primary}">${escapeHtml(biz)}</h1>
        <p style="margin:4px 0 0;color:#64748B">${docLabel(invoice.documentType)} · ${escapeHtml(invoice.documentNumber)}</p></div>
        <div style="text-align:right;font-size:13px;color:#475569">
          ${invoice.user?.businessEmail ? `${escapeHtml(invoice.user.businessEmail)}<br>` : ''}
          ${invoice.user?.businessPhone ? escapeHtml(invoice.user.businessPhone) : ''}
        </div>
      </div>
    </div>
    <div class="content">${billToBlock(invoice)}${lineItemsTable(invoice, primary, accent)}${totalsBlock(invoice, primary)}
      ${notesBlock(invoice)}${signatureBlock(invoice.signature, 'Signature')}${signatureBlock(invoice.clientSignature, 'Client')}</div>`;
}

function renderMinimal(invoice: InvoicePdfData, tpl: InvoiceTemplate) {
  const biz = invoice.user?.businessName || invoice.user?.name || 'InvoiceFlow';
  const primary = tpl.color;
  return `
    <div class="content" style="padding-top:48px">
      <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;margin:0">${docLabel(invoice.documentType)}</p>
      <h1 style="margin:4px 0 24px;font-size:32px;font-weight:300;color:${primary}">${escapeHtml(invoice.documentNumber)}</h1>
      <p style="color:#64748B;margin:0 0 32px">${escapeHtml(biz)}</p>
      ${billToBlock(invoice)}
      ${lineItemsTable(invoice, primary, '#CBD5E1')}
      ${totalsBlock(invoice, primary)}
      ${notesBlock(invoice)}
      ${signatureBlock(invoice.signature, 'Signed')}${signatureBlock(invoice.clientSignature, 'Client')}
    </div>`;
}

function renderBold(invoice: InvoicePdfData, tpl: InvoiceTemplate) {
  const biz = invoice.user?.businessName || invoice.user?.name || 'InvoiceFlow';
  const primary = tpl.color;
  const accent = tpl.accentColor;
  return `
    <div style="background:${primary};padding:6px 40px"></div>
    <div class="content">
      <h1 style="margin:0;font-size:42px;font-weight:900;color:${primary};letter-spacing:-1px">${escapeHtml(invoice.documentNumber)}</h1>
      <p style="font-size:18px;font-weight:700;margin:8px 0 4px">${escapeHtml(biz)}</p>
      <p style="color:${accent};font-weight:600;margin:0 0 28px;text-transform:uppercase;font-size:12px;letter-spacing:1px">${docLabel(invoice.documentType)}</p>
      ${billToBlock(invoice)}${lineItemsTable(invoice, primary, accent)}${totalsBlock(invoice, primary)}
      ${notesBlock(invoice)}${signatureBlock(invoice.signature, 'Sign here')}${signatureBlock(invoice.clientSignature, 'Client')}</div>`;
}

function renderProfessional(invoice: InvoicePdfData, tpl: InvoiceTemplate) {
  const biz = invoice.user?.businessName || invoice.user?.name || 'InvoiceFlow';
  const primary = tpl.color;
  const accent = tpl.accentColor;
  return `
    <div style="display:flex;min-height:120px">
      <div style="width:8px;background:${primary}"></div>
      <div style="flex:1;background:#F0FDFA;padding:28px 32px">
        <p style="margin:0;font-size:11px;color:${accent};text-transform:uppercase;letter-spacing:1px">${docLabel(invoice.documentType)}</p>
        <h1 style="margin:6px 0 0;font-size:24px;color:${primary}">${escapeHtml(invoice.documentNumber)}</h1>
        <p style="margin:6px 0 0;color:#0F766E">${escapeHtml(biz)}</p>
      </div>
    </div>
    <div class="content">${billToBlock(invoice)}${lineItemsTable(invoice, primary, accent)}${totalsBlock(invoice, primary)}
      ${notesBlock(invoice)}${signatureBlock(invoice.signature, 'Authorized')}${signatureBlock(invoice.clientSignature, 'Client Acceptance')}</div>`;
}

function renderCreative(invoice: InvoicePdfData, tpl: InvoiceTemplate) {
  const biz = invoice.user?.businessName || invoice.user?.name || 'InvoiceFlow';
  const primary = tpl.color;
  const accent = tpl.accentColor;
  return `
    <div style="background:linear-gradient(135deg,${primary},${accent});color:#fff;padding:36px 40px;border-radius:0 0 24px 24px">
      <h1 style="margin:0;font-size:28px">${escapeHtml(invoice.documentNumber)}</h1>
      <p style="margin:8px 0 0;opacity:0.9">${escapeHtml(biz)} · ${docLabel(invoice.documentType)}</p>
    </div>
    <div class="content" style="background:#FFF7FB">${billToBlock(invoice)}
      <div style="background:#fff;border-radius:12px;padding:16px;border:1px solid #FBCFE8">
        ${lineItemsTable(invoice, primary, accent)}
      </div>
      ${totalsBlock(invoice, primary)}${notesBlock(invoice)}
      ${signatureBlock(invoice.signature, 'Your signature')}${signatureBlock(invoice.clientSignature, 'Client')}</div>`;
}

function billToBlock(invoice: InvoicePdfData) {
  const issue = new Date(invoice.issueDate).toLocaleDateString();
  const due = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : null;
  return `
    <div style="display:flex;justify-content:space-between;margin-bottom:24px;gap:24px">
      <div>
        <p style="font-size:11px;color:#94A3B8;text-transform:uppercase;margin:0 0 6px">Bill To</p>
        <p style="margin:0;font-weight:700;font-size:16px">${escapeHtml(invoice.client.name)}</p>
        ${invoice.client.company ? `<p style="margin:4px 0 0;color:#475569">${escapeHtml(invoice.client.company)}</p>` : ''}
        ${invoice.client.email ? `<p style="margin:4px 0 0;color:#64748B">${escapeHtml(invoice.client.email)}</p>` : ''}
        ${invoice.client.address ? `<p style="margin:4px 0 0;color:#64748B">${escapeHtml(invoice.client.address)}</p>` : ''}
      </div>
      <div style="text-align:right">
        <p style="margin:0"><span style="color:#94A3B8">Issued:</span> ${issue}</p>
        ${due ? `<p style="margin:4px 0 0"><span style="color:#94A3B8">Due:</span> <strong>${due}</strong></p>` : ''}
        ${invoice.user?.taxId ? `<p style="margin:8px 0 0;font-size:12px;color:#64748B">Tax ID: ${escapeHtml(invoice.user.taxId)}</p>` : ''}
      </div>
    </div>`;
}

function notesBlock(invoice: InvoicePdfData) {
  let html = '';
  if (invoice.terms) {
    html += `<p style="margin-top:28px;color:#475569"><strong>Terms</strong><br>${escapeHtml(invoice.terms)}</p>`;
  }
  if (invoice.notes) {
    html += `<p style="margin-top:16px;color:#64748B"><strong>Notes</strong><br>${escapeHtml(invoice.notes)}</p>`;
  }
  return html;
}

const RENDERERS: Record<string, (inv: InvoicePdfData, tpl: InvoiceTemplate) => string> = {
  modern: renderModern,
  classic: renderClassic,
  minimal: renderMinimal,
  bold: renderBold,
  professional: renderProfessional,
  creative: renderCreative,
};

export function buildInvoicePdfHtml(invoice: InvoicePdfData) {
  const tpl = getTemplate(invoice.templateId);
  const render = RENDERERS[tpl.layout] || renderModern;
  const body = render(invoice, tpl);
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${baseStyles(tpl.layout, tpl.color, tpl.accentColor)}</style></head>
<body>${body}</body></html>`;
}

export function pdfFilename(invoice: InvoicePdfData) {
  const type = invoice.documentType.toLowerCase().replace('_', '-');
  return `${type}-${invoice.documentNumber.replace(/[^a-zA-Z0-9-]/g, '')}.pdf`;
}
