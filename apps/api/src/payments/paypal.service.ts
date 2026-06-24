import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';

@Injectable()
export class PayPalService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private payments: PaymentsService,
  ) {}

  async createCheckout(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true },
    });
    if (!invoice) throw new Error('Invoice not found');

    const clientId = this.config.get('PAYPAL_CLIENT_ID');
    if (!clientId || clientId.includes('placeholder')) {
      const url = `https://www.paypal.com/paypalme/invoiceflow/${invoice.total.toFixed(2)}?invoice=${invoice.documentNumber}`;
      return { url, mock: true, provider: 'paypal' };
    }

    // Production: integrate PayPal Orders API v2
    const url = `https://www.paypal.com/checkoutnow?token=mock_${invoiceId}`;
    return { url, provider: 'paypal' };
  }
}
