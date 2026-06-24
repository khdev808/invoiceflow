import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';
import { getAmountDue } from './payment.utils';

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
      include: { client: true, payments: true },
    });
    if (!invoice) throw new Error('Invoice not found');

    const paidTotal = invoice.payments.reduce((s, p) => s + p.amount, 0);
    const amount = getAmountDue(invoice, paidTotal);
    if (amount <= 0) return { url: null, alreadyPaid: true, provider: 'paypal' };

    const clientId = this.config.get('PAYPAL_CLIENT_ID');
    if (!clientId || clientId.includes('placeholder')) {
      const url = `https://www.paypal.com/paypalme/invoiceflow/${amount.toFixed(2)}?invoice=${invoice.documentNumber}`;
      return { url, mock: true, provider: 'paypal', amount };
    }

    const url = `https://www.paypal.com/checkoutnow?token=mock_${invoiceId}&amount=${amount}`;
    return { url, provider: 'paypal', amount };
  }
}
