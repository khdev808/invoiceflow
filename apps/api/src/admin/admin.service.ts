import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [userCount, invoiceCount, totalRevenue, recentUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.invoice.count({ where: { documentType: 'INVOICE' } }),
      this.prisma.invoice.aggregate({
        where: { status: 'PAID', documentType: 'INVOICE' },
        _sum: { total: true },
      }),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          email: true,
          name: true,
          businessName: true,
          plan: true,
          createdAt: true,
          _count: { select: { invoices: true, clients: true } },
        },
      }),
    ]);

    const planBreakdown = await this.prisma.user.groupBy({
      by: ['plan'],
      _count: true,
    });

    const monthlySignups = await this.prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
      SELECT TO_CHAR("createdAt", 'YYYY-MM') as month, COUNT(*)::bigint as count
      FROM "User"
      WHERE "createdAt" > NOW() - INTERVAL '12 months'
      GROUP BY month
      ORDER BY month
    `;

    return {
      userCount,
      invoiceCount,
      totalRevenue: totalRevenue._sum.total || 0,
      planBreakdown,
      monthlySignups: monthlySignups.map((r) => ({ month: r.month, count: Number(r.count) })),
      recentUsers,
    };
  }

  getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    return this.prisma.user.findMany({
      where: search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      skip,
      take: limit,
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
    });
  }

  updateUserPlan(userId: string, plan: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { plan, planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
    });
  }
}
