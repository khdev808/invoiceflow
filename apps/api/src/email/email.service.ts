import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

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

  async sendInvoiceEmail(params: {
    to: string;
    clientName: string;
    documentNumber: string;
    total: number;
    currency: string;
    portalUrl: string;
    businessName: string;
  }) {
    const subject = `Invoice ${params.documentNumber} from ${params.businessName}`;
    const html = `
      <h2>Invoice ${params.documentNumber}</h2>
      <p>Hi ${params.clientName},</p>
      <p>You have a new invoice for <strong>${params.currency} ${params.total.toFixed(2)}</strong> from ${params.businessName}.</p>
      <p><a href="${params.portalUrl}" style="background:#2563EB;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">View & Pay Invoice</a></p>
      <p>Thank you for your business!</p>
    `;
    return this.send(params.to, subject, html);
  }

  async sendReminderEmail(params: {
    to: string;
    clientName: string;
    documentNumber: string;
    total: number;
    dueDate?: Date;
    portalUrl: string;
    overdue?: boolean;
  }) {
    const subject = params.overdue
      ? `Overdue: Invoice ${params.documentNumber}`
      : `Reminder: Invoice ${params.documentNumber} due soon`;
    const html = `
      <p>Hi ${params.clientName},</p>
      <p>${params.overdue ? 'This invoice is overdue.' : 'This is a friendly reminder that your invoice is due soon.'}</p>
      <p><strong>${params.documentNumber}</strong> — $${params.total.toFixed(2)}${params.dueDate ? ` due ${params.dueDate.toLocaleDateString()}` : ''}</p>
      <p><a href="${params.portalUrl}">Pay now</a></p>
    `;
    return this.send(params.to, subject, html);
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.log(`[EMAIL-DEV] To: ${to} | Subject: ${subject}`);
      return { sent: false, dev: true };
    }
    await this.transporter.sendMail({
      from: this.config.get('SMTP_FROM') || 'billing@invoiceflow.app',
      to,
      subject,
      html,
    });
    return { sent: true };
  }
}
