import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const key = this.config.get('STRIPE_SECRET_KEY');
    if (key && !key.includes('placeholder')) {
      this.stripe = new Stripe(key);
    }
  }

  async createPaymentLink(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true, user: true },
    });
    if (!invoice) throw new Error('Invoice not found');

    if (!this.stripe) {
      const mockLink = `https://pay.invoiceflow.app/invoice/${invoiceId}`;
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: { paymentLink: mockLink },
      });
      return { url: mockLink, mock: true };
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: invoice.currency.toLowerCase(),
            product_data: {
              name: `Invoice ${invoice.documentNumber}`,
              description: `Payment for ${invoice.client.name}`,
            },
            unit_amount: Math.round(invoice.total * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { invoiceId },
      success_url: `https://invoiceflow.app/paid/${invoiceId}`,
      cancel_url: `https://invoiceflow.app/invoice/${invoiceId}`,
    });

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { paymentLink: session.url, stripePaymentId: session.id },
    });

    return { url: session.url };
  }
}
