import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

export const PLAN_LIMITS: Record<string, number> = {
  free: 25,
  pro: 999999,
  business: 999999,
};

export const PLAN_PRICES: Record<string, number> = {
  free: 0,
  pro: 9.99,
  business: 19.99,
};

@Injectable()
export class PlanService {
  private stripe: Stripe | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    if (key && !key.includes('placeholder')) {
      this.stripe = new Stripe(key);
    }
  }

  async getEffectivePlan(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return 'free';
    if (user.plan !== 'free' && user.planExpiresAt && user.planExpiresAt < new Date()) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { plan: 'free', planExpiresAt: null },
      });
      return 'free';
    }
    return user.plan;
  }

  async checkInvoiceLimit(userId: string) {
    const plan = await this.getEffectivePlan(userId);
    const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const count = await this.prisma.invoice.count({
      where: {
        userId,
        documentType: 'INVOICE',
        createdAt: { gte: startOfMonth },
      },
    });

    if (count >= limit) {
      throw new Error(`Plan limit reached: ${limit} invoices/month on ${plan} plan. Upgrade to Pro for unlimited.`);
    }

    return { used: count, limit, plan };
  }

  async getUsage(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const plan = await this.getEffectivePlan(userId);
    const limit = PLAN_LIMITS[plan] ?? 25;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const used = await this.prisma.invoice.count({
      where: { userId, documentType: 'INVOICE', createdAt: { gte: startOfMonth } },
    });
    return {
      used,
      limit,
      invoicesUsed: used,
      invoiceLimit: limit,
      plan,
      remaining: Math.max(0, limit - used),
      planExpiresAt: user?.planExpiresAt,
      prices: PLAN_PRICES,
      features: this.getPlanFeatures(plan),
      stripeConfigured: Boolean(this.stripe),
    };
  }

  getPlanFeatures(plan: string) {
    const isPaid = plan === 'pro' || plan === 'business';
    return {
      unlimitedInvoices: isPaid,
      premiumTemplates: isPaid,
      removeBranding: isPaid,
      ocrScanning: isPaid,
      apiAccess: plan === 'business',
      teamSeats: plan === 'business',
    };
  }

  async checkFeature(userId: string, feature: 'ocr' | 'premiumTemplates') {
    const plan = await this.getEffectivePlan(userId);
    const features = this.getPlanFeatures(plan);
    if (feature === 'ocr' && !features.ocrScanning) {
      throw new ForbiddenException('Receipt OCR scanning requires a Pro or Business plan. Upgrade to unlock.');
    }
    if (feature === 'premiumTemplates' && !features.premiumTemplates) {
      throw new ForbiddenException('Premium templates require a Pro or Business plan.');
    }
    return true;
  }

  async applyPlanUpgrade(userId: string, plan: 'pro' | 'business', months = 1) {
    const expires = new Date();
    expires.setMonth(expires.getMonth() + months);
    return this.prisma.user.update({
      where: { id: userId },
      data: { plan, planExpiresAt: expires },
      select: { id: true, plan: true, planExpiresAt: true },
    });
  }

  /** Stripe Checkout for subscriptions when configured; direct upgrade in dev only */
  async upgradePlan(userId: string, plan: 'pro' | 'business') {
    if (!['pro', 'business'].includes(plan)) {
      throw new BadRequestException('Invalid plan');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    if (this.stripe) {
      const adminUrl = (this.config.get('ADMIN_APP_URL') || 'http://localhost:3000').replace(/\/$/, '');
      const price = PLAN_PRICES[plan];
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `InvoiceFlow ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
                description: `Monthly ${plan} subscription`,
              },
              unit_amount: Math.round(price * 100),
              recurring: { interval: 'month' },
            },
            quantity: 1,
          },
        ],
        metadata: { userId, plan, type: 'subscription' },
        success_url: `${adminUrl}/app/settings?upgraded=${plan}`,
        cancel_url: `${adminUrl}/app/settings`,
      });
      return { checkoutUrl: session.url, plan };
    }

    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException(
        'Online billing is not configured. Set STRIPE_SECRET_KEY on the API service.',
      );
    }

    const updated = await this.applyPlanUpgrade(userId, plan);
    return { ...updated, message: 'Plan upgraded (dev mode — configure Stripe for production billing)' };
  }
}
