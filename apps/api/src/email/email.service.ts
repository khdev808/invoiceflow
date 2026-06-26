import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { buildInvoiceEmailHtml } from './email-templates';

export type EmailSendResult = {
  sent: boolean;
  dev?: boolean;
  error?: string;
};

type Attachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private config: ConfigService) {
    const host = this.config.get('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(this.config.get('SMTP_PORT') || '587'),
        secure: this.config.get('SMTP_SECURE') === 'true',
        auth: {
          user: this.config.get('SMTP_USER'),
          pass: this.config.get('SMTP_PASS'),
        },
      });
    }
  }

  isConfigured(): boolean {
    return Boolean(this.transporter);
  }

  async sendInvoiceEmail(params: {
    to: string;
    clientName: string;
    documentNumber: string;
    documentType: string;
    total: number;
    currency: string;
    dueDate?: Date | string | null;
    portalUrl: string;
    businessName: string;
    accentColor?: string;
    pdfBuffer?: Buffer;
  }): Promise<EmailSendResult> {
    const docLabel = params.documentType === 'ESTIMATE' ? 'estimate' : params.documentType === 'CREDIT_NOTE' ? 'credit note' : 'invoice';
    const subject = `Your ${docLabel} ${params.documentNumber} from ${params.businessName}`;
    const html = buildInvoiceEmailHtml({
      clientName: params.clientName,
      documentNumber: params.documentNumber,
      documentType: params.documentType,
      total: params.total,
      currency: params.currency,
      dueDate: params.dueDate,
      portalUrl: params.portalUrl,
      businessName: params.businessName,
      accentColor: params.accentColor,
    });
    const attachments: Attachment[] = params.pdfBuffer
      ? [{ filename: `${params.documentNumber}.pdf`, content: params.pdfBuffer, contentType: 'application/pdf' }]
      : [];
    return this.send(params.to, subject, html, attachments);
  }

  async sendReminderEmail(params: {
    to: string;
    clientName: string;
    documentNumber: string;
    total: number;
    dueDate?: Date;
    portalUrl: string;
    overdue?: boolean;
    currency?: string;
  }) {
    const currency = params.currency || 'USD';
    const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(params.total);
    const subject = params.overdue
      ? `Overdue: Invoice ${params.documentNumber}`
      : `Reminder: Invoice ${params.documentNumber} due soon`;
    const html = `
      <p>Hi ${params.clientName},</p>
      <p>${params.overdue ? 'This invoice is overdue.' : 'This is a friendly reminder that your invoice is due soon.'}</p>
      <p><strong>${params.documentNumber}</strong> — ${amount}${params.dueDate ? ` due ${params.dueDate.toLocaleDateString()}` : ''}</p>
      <p><a href="${params.portalUrl}" style="background:#2563EB;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Pay now</a></p>
    `;
    return this.send(params.to, subject, html);
  }

  async sendPasswordResetEmail(params: { to: string; name: string; resetUrl: string }) {
    const subject = 'Reset your InvoiceFlow password';
    const html = `
      <p>Hi ${params.name},</p>
      <p>We received a request to reset your password. Click the link below — it expires in 1 hour.</p>
      <p><a href="${params.resetUrl}" style="background:#2563EB;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Reset password</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `;
    return this.send(params.to, subject, html);
  }

  private async send(to: string, subject: string, html: string, attachments: Attachment[] = []): Promise<EmailSendResult> {
    if (!this.transporter) {
      this.logger.log(`[EMAIL-DEV] To: ${to} | Subject: ${subject}${attachments.length ? ` | ${attachments.length} attachment(s)` : ''}`);
      return { sent: false, dev: true };
    }
    try {
      await this.transporter.sendMail({
        from: this.config.get('SMTP_FROM') || 'billing@invoiceflow.app',
        to,
        subject,
        html,
        attachments: attachments.map((a) => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType,
        })),
      });
      return { sent: true };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown email error';
      this.logger.error(`Failed to send email to ${to}: ${error}`);
      return { sent: false, error };
    }
  }
}
