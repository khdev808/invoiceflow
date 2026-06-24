import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PLAN_LIMITS: Record<string, number> = {
  free: 25,
  pro: 999999,
  business: 999999,
};

@Injectable()
export class PlanService {
  constructor(private prisma: PrismaService) {}

  async checkInvoiceLimit(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const limit = PLAN_LIMITS[user.plan] ?? PLAN_LIMITS.free;
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
      throw new Error(`Plan limit reached: ${limit} invoices/month on ${user.plan} plan. Upgrade to Pro for unlimited.`);
    }

    return { used: count, limit, plan: user.plan };
  }

  async getUsage(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const limit = PLAN_LIMITS[user?.plan ?? 'free'] ?? 25;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const used = await this.prisma.invoice.count({
      where: { userId, documentType: 'INVOICE', createdAt: { gte: startOfMonth } },
    });
    return { used, limit, plan: user?.plan ?? 'free' };
  }
}
