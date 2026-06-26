import { Controller, Post, Get, Param, Req, Headers, UseGuards } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';
import { PayPalService } from './paypal.service';
import { AppUserGuard } from '../auth/guards';
import { NotificationsService } from '../notifications/notifications.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { ReferralsService } from '../referrals/referrals.service';

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
    private referrals: ReferralsService,
  ) {
    const key = this.config.get('STRIPE_SECRET_KEY');
    if (key && !key.includes('placeholder')) this.stripe = new Stripe(key);
  }

  @UseGuards(AppUserGuard)
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

  @Get('public/stripe-config')
  stripeConfig() {
    return { publishableKey: this.payments.getPublishableKey() };
  }

  @Get('public/intent/:invoiceId')
  publicIntent(@Param('invoiceId') invoiceId: string) {
    return this.payments.createPaymentIntent(invoiceId);
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

      if (session.metadata?.type === 'subscription' && session.metadata?.userId && session.metadata?.plan) {
        const plan = session.metadata.plan as 'pro' | 'business';
        if (plan === 'pro' || plan === 'business') {
          const expires = new Date();
          expires.setMonth(expires.getMonth() + 1);
          await this.prisma.user.update({
            where: { id: session.metadata.userId },
            data: { plan, planExpiresAt: expires },
          });
          await this.referrals.rewardReferrerOnUpgrade(session.metadata.userId);
        }
        return { received: true };
      }

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

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const invoiceId = intent.metadata?.invoiceId;
      const amount = (intent.amount_received || 0) / 100;
      if (invoiceId && amount > 0) {
        const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
        if (invoice) {
          let method: 'STRIPE' | 'APPLE_PAY' | 'GOOGLE_PAY' = 'STRIPE';
          if (this.stripe && intent.payment_method) {
            try {
              const pm = await this.stripe.paymentMethods.retrieve(intent.payment_method as string);
              if (pm.card?.wallet?.type === 'apple_pay') method = 'APPLE_PAY';
              else if (pm.card?.wallet?.type === 'google_pay') method = 'GOOGLE_PAY';
            } catch { /* keep STRIPE */ }
          }
          await this.payments.processStripePayment(invoiceId, amount, intent.id, method);
          await this.notifications.notify(invoice.userId, {
            title: 'Payment Received',
            body: `Payment of $${amount.toFixed(2)} for ${invoice.documentNumber}`,
            type: 'payment_received',
            data: { invoiceId },
          });
          await this.integrations.dispatch(invoice.userId, 'payment.received', {
            invoiceId,
            amount,
            method: method.toLowerCase(),
          });
        }
      }
    }

    return { received: true };
  }
}
