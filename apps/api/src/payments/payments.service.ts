import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { getAmountDue, getDepositDue } from './payment.utils';
import { getPortalBase } from '../config/portal-url';

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

  private async resolveChargeAmount(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true, payments: true },
    });
    if (!invoice) throw new Error('Invoice not found');

    const paidTotal = invoice.payments.reduce((s, p) => s + p.amount, 0);
    const due = getAmountDue(invoice, paidTotal);
    return { invoice, due, paidTotal };
  }

  async createPaymentLink(invoiceId: string, type: 'deposit' | 'full' | 'auto' = 'auto') {
    const { invoice, due, paidTotal } = await this.resolveChargeAmount(invoiceId);
    if (due <= 0 && paidTotal >= invoice.total) {
      return { url: null, alreadyPaid: true };
    }

    const chargeAmount = type === 'full'
      ? Math.max(0, invoice.total - paidTotal)
      : due;

    const portalBase = getPortalBase();

    if (!this.stripe) {
      if (process.env.NODE_ENV === 'production') {
        return { url: null, configured: false, message: 'Stripe is not configured for online payments' };
      }
      const mockLink = `${portalBase}/${invoiceId}?pay=mock&amount=${chargeAmount}`;
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: { paymentLink: mockLink },
      });
      return { url: mockLink, mock: true, amount: chargeAmount, qrData: mockLink };
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'link'],
      payment_method_options: {
        card: { request_three_d_secure: 'automatic' },
      },
      line_items: [
        {
          price_data: {
            currency: invoice.currency.toLowerCase(),
            product_data: {
              name: `Invoice ${invoice.documentNumber}`,
              description: invoice.depositPaid
                ? `Balance for ${invoice.client?.name || 'client'}`
                : invoice.depositPercent || invoice.depositAmount
                  ? `Deposit for ${invoice.documentNumber}`
                  : `Payment for ${invoice.documentNumber}`,
            },
            unit_amount: Math.round(chargeAmount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { invoiceId, paymentType: invoice.depositPaid ? 'balance' : 'deposit_or_full' },
      success_url: `${portalBase}/${invoiceId}?paid=1`,
      cancel_url: `${portalBase}/${invoiceId}`,
    });

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { paymentLink: session.url, stripePaymentId: session.id },
    });

    return { url: session.url, amount: chargeAmount, qrData: session.url };
  }

  getPublishableKey() {
    const key = this.config.get<string>('STRIPE_PUBLISHABLE_KEY');
    return key && !key.includes('placeholder') ? key : null;
  }

  async createPaymentIntent(invoiceId: string) {
    const { invoice, due, paidTotal } = await this.resolveChargeAmount(invoiceId);
    if (due <= 0 && paidTotal >= invoice.total) {
      return { alreadyPaid: true, amount: 0 };
    }

    const publishableKey = this.getPublishableKey();
    if (!this.stripe || !publishableKey) {
      if (process.env.NODE_ENV === 'production') {
        return { configured: false, message: 'Stripe is not configured' };
      }
      return { mock: true, clientSecret: null, publishableKey: null, amount: due };
    }

    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(due * 100),
      currency: invoice.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: { invoiceId },
      description: `Invoice ${invoice.documentNumber}`,
    });

    return {
      clientSecret: intent.client_secret,
      publishableKey,
      amount: due,
      currency: invoice.currency,
    };
  }

  async processStripePayment(invoiceId: string, amount: number, transactionId?: string, method: 'STRIPE' | 'APPLE_PAY' | 'GOOGLE_PAY' = 'STRIPE') {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });
    if (!invoice) return;

    await this.prisma.payment.create({
      data: {
        invoiceId,
        amount,
        method,
        transactionId,
      },
    });

    const updated = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });
    const paidTotal = updated!.payments.reduce((s, p) => s + p.amount, 0);
    const depositDue = getDepositDue(invoice);

    const updates: Record<string, unknown> = {};
    if (depositDue > 0 && !invoice.depositPaid && paidTotal >= depositDue) {
      updates.depositPaid = true;
    }
    if (paidTotal >= invoice.total) {
      updates.status = 'PAID';
      updates.paidAt = new Date();
    }

    if (Object.keys(updates).length > 0) {
      await this.prisma.invoice.update({ where: { id: invoiceId }, data: updates });
    }

    return { paidTotal, invoice: updated };
  }
}
