import { Controller, Post, Get, Param, Req, Headers, UseGuards } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';
import { PayPalService } from './paypal.service';
import { JwtAuthGuard } from '../auth/guards';
import { NotificationsService } from '../notifications/notifications.service';
import { IntegrationsService } from '../integrations/integrations.service';

@Controller('payments')
export class PaymentsController {
  private stripe: Stripe | null = null;

  constructor(
    private prisma: PrismaService,
    private payments: PaymentsService,
    private paypal: PayPalService,
    private config: ConfigService,
    private notifications: NotificationsService,
    private integrations: IntegrationsService,
  ) {
    const key = this.config.get('STRIPE_SECRET_KEY');
    if (key && !key.includes('placeholder')) this.stripe = new Stripe(key);
  }

  @UseGuards(JwtAuthGuard)
  @Post('link/:invoiceId')
  createLink(@Param('invoiceId') invoiceId: string) {
    return this.payments.createPaymentLink(invoiceId);
  }

  @Get('public/link/:invoiceId')
  async publicLink(@Param('invoiceId') invoiceId: string) {
    return this.payments.createPaymentLink(invoiceId);
  }

  @Get('public/paypal/:invoiceId')
  async publicPayPal(@Param('invoiceId') invoiceId: string) {
    return this.paypal.createCheckout(invoiceId);
  }

  @Post('webhook/stripe')
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!this.stripe) return { received: true, mock: true };

    const secret = this.config.get('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(req.rawBody!, signature, secret!);
    } catch {
      return { error: 'Invalid signature' };
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const invoiceId = session.metadata?.invoiceId;
      const amount = (session.amount_total || 0) / 100;
      if (invoiceId && amount > 0) {
        const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
        if (invoice) {
          await this.payments.processStripePayment(
            invoiceId,
            amount,
            session.payment_intent as string,
          );
          await this.notifications.notify(invoice.userId, {
            title: 'Payment Received',
            body: `Stripe payment of $${amount.toFixed(2)} for ${invoice.documentNumber}`,
            type: 'payment_received',
            data: { invoiceId },
          });
          await this.integrations.dispatch(invoice.userId, 'payment.received', {
            invoiceId,
            amount,
            method: 'stripe',
          });
        }
      }
    }
    return { received: true };
  }
}
