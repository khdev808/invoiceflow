import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PlanService } from '../plan/plan.service';

@Injectable()
export class ReferralsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private plan: PlanService,
  ) {}

  async resolveReferrerId(code: string): Promise<string | null> {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return null;
    const referrer = await this.prisma.user.findFirst({
      where: { referralCode: normalized },
      select: { id: true },
    });
    return referrer?.id ?? null;
  }

  async onReferralSignup(referrerId: string, newUserId: string, newUserName: string) {
    await this.notifications.notify(referrerId, {
      title: 'New referral!',
      body: `${newUserName} joined with your referral code.`,
      type: 'referral_signup',
      data: { userId: newUserId },
    });
  }

  async getStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });
    if (!user) throw new BadRequestException('User not found');

    let referralCode = user.referralCode;
    if (!referralCode) {
      referralCode = await this.ensureReferralCode(userId);
    }

    const referralCount = await this.prisma.user.count({
      where: { referredByUserId: userId },
    });

    const upgradedReferrals = await this.prisma.user.count({
      where: {
        referredByUserId: userId,
        plan: { in: ['pro', 'business'] },
      },
    });

    return {
      referralCode,
      referralCount,
      upgradedReferrals,
      reward: 'Give Pro, get Pro — when a referral upgrades, you get 1 free month of Pro.',
    };
  }

  async rewardReferrerOnUpgrade(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referredByUserId: true, name: true },
    });
    if (!user?.referredByUserId) return;

    await this.plan.applyPlanUpgrade(user.referredByUserId, 'pro', 1);
    await this.notifications.notify(user.referredByUserId, {
      title: 'Referral reward!',
      body: `${user.name} upgraded — you earned 1 free month of Pro.`,
      type: 'referral_reward',
      data: { userId },
    });
  }

  private async ensureReferralCode(userId: string): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let attempt = 0; attempt < 8; attempt++) {
      let code = '';
      for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
      try {
        const updated = await this.prisma.user.update({
          where: { id: userId },
          data: { referralCode: code },
          select: { referralCode: true },
        });
        return updated.referralCode!;
      } catch {
        /* collision */
      }
    }
    throw new BadRequestException('Could not generate referral code');
  }
}
