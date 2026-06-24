import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminPlan, ADMIN_PLANS } from './dto/admin.dto';

type PeriodKey = 'today' | 'month' | 'year';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const now = new Date();
    const [totals, periods, userGrowthMonthly, userGrowthDaily, invoiceGrowthMonthly, planBreakdown, statusBreakdown, recentUsers, recentInvoices, recentPayments] =
      await Promise.all([
        this.getTotals(),
        this.getAllPeriodStats(now),
        this.getUserGrowthMonthly(),
        this.getUserGrowthDaily(),
        this.getInvoiceGrowthMonthly(),
        this.prisma.user.groupBy({ by: ['plan'], _count: true }),
        this.prisma.invoice.groupBy({
          by: ['status'],
          where: { documentType: 'INVOICE' },
          _count: true,
        }),
        this.prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            email: true,
            name: true,
            businessName: true,
            role: true,
            plan: true,
            createdAt: true,
            _count: { select: { invoices: true, clients: true } },
          },
        }),
        this.prisma.invoice.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            documentNumber: true,
            documentType: true,
            status: true,
            total: true,
            currency: true,
            createdAt: true,
            user: { select: { id: true, name: true, email: true } },
            client: { select: { name: true } },
          },
        }),
        this.prisma.payment.findMany({
          orderBy: { paidAt: 'desc' },
          take: 8,
          select: {
            id: true,
            amount: true,
            method: true,
            paidAt: true,
            invoice: {
              select: {
                documentNumber: true,
                currency: true,
                user: { select: { name: true } },
              },
            },
          },
        }),
      ]);

    return {
      generatedAt: now.toISOString(),
      totals,
      periods,
      userGrowthMonthly,
      userGrowthDaily,
      invoiceGrowthMonthly,
      planBreakdown: planBreakdown.map((p) => ({
        plan: p.plan,
        count: p._count,
      })),
      statusBreakdown: statusBreakdown.map((s) => ({
        status: s.status,
        count: s._count,
      })),
      recentUsers,
      recentInvoices,
      recentPayments,
    };
  }

  async getUsers(page = 1, limit = 20, search?: string) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
            { businessName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: safeLimit,
        select: {
          id: true,
          email: true,
          name: true,
          businessName: true,
          role: true,
          plan: true,
          createdAt: true,
          _count: { select: { invoices: true, clients: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page: safePage, limit: safeLimit, pages: Math.ceil(total / safeLimit) };
  }

  async updateUserPlan(adminId: string, userId: string, plan: string) {
    if (!ADMIN_PLANS.includes(plan as AdminPlan)) {
      throw new BadRequestException(`Invalid plan. Allowed: ${ADMIN_PLANS.join(', ')}`);
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        planExpiresAt:
          plan === 'free' ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        planExpiresAt: true,
      },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action: 'USER_PLAN_UPDATE',
        target: userId,
        metadata: { previousPlan: user.plan, newPlan: plan, userEmail: user.email },
      },
    });

    return updated;
  }

  async getAuditLogs(limit = 20) {
    const safeLimit = Math.min(50, Math.max(1, limit));
    return this.prisma.adminAuditLog.findMany({
      take: safeLimit,
      orderBy: { createdAt: 'desc' },
    });
  }

  private async getTotals() {
    const [userCount, invoiceCount, estimateCount, invoiceVolume, paidVolume, paymentsCollected, clientCount] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.invoice.count({ where: { documentType: 'INVOICE' } }),
        this.prisma.invoice.count({ where: { documentType: 'ESTIMATE' } }),
        this.prisma.invoice.aggregate({
          where: { documentType: 'INVOICE' },
          _sum: { total: true },
        }),
        this.prisma.invoice.aggregate({
          where: { status: 'PAID', documentType: 'INVOICE' },
          _sum: { total: true },
        }),
        this.prisma.payment.aggregate({ _sum: { amount: true } }),
        this.prisma.client.count(),
      ]);

    return {
      userCount,
      invoiceCount,
      estimateCount,
      clientCount,
      invoiceVolume: invoiceVolume._sum.total || 0,
      paidInvoiceVolume: paidVolume._sum.total || 0,
      paymentsCollected: paymentsCollected._sum.amount || 0,
    };
  }

  private async getAllPeriodStats(now: Date) {
    const periods: PeriodKey[] = ['today', 'month', 'year'];
    const entries = await Promise.all(
      periods.map(async (key) => [key, await this.getPeriodStats(this.periodStart(key, now))] as const),
    );
    return Object.fromEntries(entries) as Record<PeriodKey, Awaited<ReturnType<AdminService['getPeriodStats']>>>;
  }

  private periodStart(period: PeriodKey, ref = new Date()): Date {
    const d = new Date(ref);
    if (period === 'today') {
      d.setHours(0, 0, 0, 0);
      return d;
    }
    if (period === 'month') {
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date(d.getFullYear(), 0, 1);
  }

  private async getPeriodStats(since: Date) {
    const invoiceWhere = { documentType: 'INVOICE' as const, createdAt: { gte: since } };
    const estimateWhere = { documentType: 'ESTIMATE' as const, createdAt: { gte: since } };

    const [
      newUsers,
      invoicesCreated,
      invoiceVolumeAgg,
      estimatesCreated,
      paidInvoiceAgg,
      paymentsCollected,
      newClients,
    ] = await Promise.all([
      this.prisma.user.count({ where: { createdAt: { gte: since } } }),
      this.prisma.invoice.count({ where: invoiceWhere }),
      this.prisma.invoice.aggregate({ where: invoiceWhere, _sum: { total: true } }),
      this.prisma.invoice.count({ where: estimateWhere }),
      this.prisma.invoice.aggregate({
        where: { status: 'PAID', documentType: 'INVOICE', paidAt: { gte: since } },
        _sum: { total: true },
      }),
      this.prisma.payment.aggregate({ where: { paidAt: { gte: since } }, _sum: { amount: true } }),
      this.prisma.client.count({ where: { createdAt: { gte: since } } }),
    ]);

    return {
      newUsers,
      invoicesCreated,
      invoiceVolume: invoiceVolumeAgg._sum.total || 0,
      estimatesCreated,
      paidInvoiceVolume: paidInvoiceAgg._sum.total || 0,
      paymentsCollected: paymentsCollected._sum.amount || 0,
      newClients,
    };
  }

  private async getUserGrowthMonthly() {
    const rows = await this.prisma.$queryRaw<Array<{ period: string; count: bigint }>>`
      SELECT TO_CHAR("createdAt", 'YYYY-MM') as period, COUNT(*)::bigint as count
      FROM "User"
      WHERE "createdAt" > NOW() - INTERVAL '12 months'
      GROUP BY period
      ORDER BY period
    `;
    return rows.map((r) => ({ period: r.period, count: Number(r.count) }));
  }

  private async getUserGrowthDaily() {
    const rows = await this.prisma.$queryRaw<Array<{ period: string; count: bigint }>>`
      SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as period, COUNT(*)::bigint as count
      FROM "User"
      WHERE "createdAt" > NOW() - INTERVAL '30 days'
      GROUP BY period
      ORDER BY period
    `;
    return rows.map((r) => ({ period: r.period, count: Number(r.count) }));
  }

  private async getInvoiceGrowthMonthly() {
    const rows = await this.prisma.$queryRaw<
      Array<{ period: string; count: bigint; volume: number | null }>
    >`
      SELECT
        TO_CHAR("createdAt", 'YYYY-MM') as period,
        COUNT(*)::bigint as count,
        COALESCE(SUM("total"), 0)::float as volume
      FROM "Invoice"
      WHERE "documentType" = 'INVOICE'
        AND "createdAt" > NOW() - INTERVAL '12 months'
      GROUP BY period
      ORDER BY period
    `;
    return rows.map((r) => ({
      period: r.period,
      count: Number(r.count),
      volume: Number(r.volume || 0),
    }));
  }
}
