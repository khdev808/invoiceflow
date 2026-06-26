import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { getTemplateColors } from './invoice-templates';
import { getCountryCompliance } from '../compliance/country-compliance';

export type InvoicePdfInput = {
  documentType: string;
  documentNumber: string;
  issueDate: Date | string;
  dueDate?: Date | string | null;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  currency?: string;
  notes?: string | null;
  terms?: string | null;
  templateId?: string | null;
  depositPercent?: number | null;
  client: { name: string; email?: string | null; company?: string | null; vatId?: string | null };
  lineItems: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  user?: {
    businessName?: string | null;
    name?: string | null;
    businessEmail?: string | null;
    businessPhone?: string | null;
    businessAddress?: string | null;
    taxId?: string | null;
  } | null;
  legalFooter?: string | null;
  invoiceCountry?: string | null;
};

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

@Injectable()
export class InvoicePdfService {
  generate(invoice: InvoicePdfInput): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 48, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const { primary } = getTemplateColors(invoice.templateId);
      const currency = invoice.currency || 'USD';
      const biz = invoice.user?.businessName || invoice.user?.name || 'InvoiceFlow';
      const compliance = getCountryCompliance(invoice.invoiceCountry);

      doc.rect(0, 0, doc.page.width, 88).fill(primary);
      doc.fillColor('#ffffff').fontSize(10).text(docLabel(invoice.documentType).toUpperCase(), 48, 28, { characterSpacing: 1 });
      doc.fontSize(22).text(invoice.documentNumber, 48, 42);
      doc.fontSize(11).text(biz, 48, 68);

      doc.fillColor('#0F172A').fontSize(10);
      let y = 108;

      doc.font('Helvetica-Bold').text('Bill to', 48, y);
      doc.font('Helvetica').text(invoice.client.name, 48, y + 14);
      if (invoice.client.company) doc.text(invoice.client.company, 48, y + 28);
      if (invoice.client.email) doc.text(invoice.client.email, 48, y + (invoice.client.company ? 42 : 28));
      if (invoice.client.vatId) {
        const vatY = y + (invoice.client.company ? 56 : 42);
        doc.text(`${compliance.clientTaxIdLabel}: ${invoice.client.vatId}`, 48, vatY);
      }

      const rightX = 320;
      doc.font('Helvetica-Bold').text('Issue date', rightX, y);
      doc.font('Helvetica').text(new Date(invoice.issueDate).toLocaleDateString(), rightX, y + 14);
      if (invoice.dueDate) {
        doc.font('Helvetica-Bold').text('Due date', rightX, y + 32);
        doc.font('Helvetica').text(new Date(invoice.dueDate).toLocaleDateString(), rightX, y + 46);
      }

      y = 180;
      doc.moveTo(48, y).lineTo(doc.page.width - 48, y).strokeColor('#E2E8F0').stroke();
      y += 16;

      doc.font('Helvetica-Bold').fontSize(9).fillColor('#64748B');
      doc.text('Description', 48, y);
      doc.text('Qty', 300, y, { width: 40, align: 'center' });
      doc.text('Price', 350, y, { width: 70, align: 'right' });
      doc.text('Total', 430, y, { width: 70, align: 'right' });
      y += 18;

      doc.font('Helvetica').fontSize(10).fillColor('#0F172A');
      for (const item of invoice.lineItems) {
        if (y > 680) {
          doc.addPage();
          y = 48;
        }
        doc.text(item.description, 48, y, { width: 240 });
        doc.text(String(item.quantity), 300, y, { width: 40, align: 'center' });
        doc.text(fmt(item.unitPrice, currency), 350, y, { width: 70, align: 'right' });
        doc.text(fmt(item.total, currency), 430, y, { width: 70, align: 'right' });
        y += Math.max(20, doc.heightOfString(item.description, { width: 240 }) + 6);
      }

      y += 12;
      doc.moveTo(48, y).lineTo(doc.page.width - 48, y).strokeColor('#E2E8F0').stroke();
      y += 16;

      const totalsX = 350;
      doc.font('Helvetica').fontSize(10);
      doc.text(`Subtotal: ${fmt(invoice.subtotal, currency)}`, totalsX, y, { width: 150, align: 'right' });
      y += 16;
      if (invoice.discountTotal > 0) {
        doc.text(`Discount: -${fmt(invoice.discountTotal, currency)}`, totalsX, y, { width: 150, align: 'right' });
        y += 16;
      }
      if (invoice.taxTotal > 0) {
        doc.text(`${compliance.taxLabel}: ${fmt(invoice.taxTotal, currency)}`, totalsX, y, { width: 150, align: 'right' });
        y += 16;
      }
      if (invoice.depositPercent) {
        doc.text(`Deposit (${invoice.depositPercent}%): ${fmt(invoice.total * invoice.depositPercent / 100, currency)}`, totalsX, y, { width: 150, align: 'right' });
        y += 16;
      }
      doc.font('Helvetica-Bold').fontSize(14).fillColor(primary).text(`Total: ${fmt(invoice.total, currency)}`, totalsX, y, { width: 150, align: 'right' });

      y += 40;
      if (invoice.notes) {
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#64748B').text('NOTES', 48, y);
        doc.font('Helvetica').fontSize(10).fillColor('#334155').text(invoice.notes, 48, y + 14, { width: 500 });
        y += 40;
      }
      if (invoice.terms) {
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#64748B').text('TERMS', 48, y);
        doc.font('Helvetica').fontSize(10).fillColor('#334155').text(invoice.terms, 48, y + 14, { width: 500 });
      }

      const footerY = doc.page.height - 60;
      doc.fontSize(8).fillColor('#94A3B8');
      if (invoice.legalFooter) {
        doc.text(invoice.legalFooter, 48, footerY - 20, { width: 500 });
      }
      if (invoice.user?.businessEmail) doc.text(invoice.user.businessEmail, 48, footerY);
      if (invoice.user?.businessPhone) doc.text(invoice.user.businessPhone, 48, footerY + 12);
      if (invoice.user?.taxId) doc.text(`${compliance.businessTaxIdLabel}: ${invoice.user.taxId}`, 48, footerY + 24);

      doc.end();
    });
  }
}
