import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private config: ConfigService) {}

  async sendInvoiceLink(params: {
    to: string;
    portalUrl: string;
    documentNumber: string;
    businessName: string;
    total?: number;
    currency?: string;
  }) {
    const amount = params.total != null
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: params.currency || 'USD' }).format(params.total)
      : '';
    const body = `${params.businessName} sent you invoice ${params.documentNumber}${amount ? ` for ${amount}` : ''}. Pay online: ${params.portalUrl}`;

    const sid = this.config.get('TWILIO_ACCOUNT_SID');
    const token = this.config.get('TWILIO_AUTH_TOKEN');
    const from = this.config.get('TWILIO_PHONE_NUMBER');

    if (!sid || !token || !from || sid.includes('placeholder')) {
      this.logger.log(`[SMS-DEV] To: ${params.to} | ${body}`);
      return {
        sent: false,
        dev: true,
        telLink: `sms:${params.to}?body=${encodeURIComponent(body)}`,
      };
    }

    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: params.to,
          From: from,
          Body: body,
        }),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`Twilio error: ${err}`);
      return { sent: false, error: 'SMS delivery failed' };
    }

    return { sent: true };
  }
}
