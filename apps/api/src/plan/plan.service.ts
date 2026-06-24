import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
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
  constructor(private prisma: PrismaService) {}

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
      plan,
      remaining: Math.max(0, limit - used),
      planExpiresAt: user?.planExpiresAt,
      prices: PLAN_PRICES,
      features: this.getPlanFeatures(plan),
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

  /** Demo upgrade — production should validate App Store / Play Billing receipts */
  async upgradePlan(userId: string, plan: 'pro' | 'business') {
    if (!['pro', 'business'].includes(plan)) {
      throw new BadRequestException('Invalid plan');
    }
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { plan, planExpiresAt: expires },
      select: { id: true, plan: true, planExpiresAt: true },
    });
    return { ...user, message: 'Plan upgraded successfully' };
  }
}
