import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async incomeReport(userId: string, from?: string, to?: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        userId,
        documentType: 'INVOICE',
        status: 'PAID',
        ...(from || to
          ? {
              paidAt: {
                ...(from && { gte: new Date(from) }),
                ...(to && { lte: new Date(to) }),
              },
            }
          : {}),
      },
      include: { client: { select: { name: true } } },
      orderBy: { paidAt: 'desc' },
    });

    const byMonth: Record<string, number> = {};
    for (const inv of invoices) {
      const key = inv.paidAt
        ? `${inv.paidAt.getFullYear()}-${String(inv.paidAt.getMonth() + 1).padStart(2, '0')}`
        : 'unknown';
      byMonth[key] = (byMonth[key] || 0) + inv.total;
    }

    return {
      total: invoices.reduce((s, i) => s + i.total, 0),
      count: invoices.length,
      byMonth,
      invoices: invoices.slice(0, 50),
    };
  }

  async profitLoss(userId: string, from?: string, to?: string) {
    const [income, expenses] = await Promise.all([
      this.incomeReport(userId, from, to),
      this.prisma.expense.findMany({
        where: {
          userId,
          ...(from || to
            ? {
                date: {
                  ...(from && { gte: new Date(from) }),
                  ...(to && { lte: new Date(to) }),
                },
              }
            : {}),
        },
      }),
    ]);

    const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);
    return {
      income: income.total,
      expenses: expenseTotal,
      profit: income.total - expenseTotal,
      incomeByMonth: income.byMonth,
    };
  }

  async exportQuickBooksCsv(userId: string, from?: string, to?: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        userId,
        documentType: 'INVOICE',
        status: { in: ['PAID', 'SENT', 'VIEWED', 'OVERDUE'] },
        ...(from || to
          ? {
              issueDate: {
                ...(from && { gte: new Date(from) }),
                ...(to && { lte: new Date(to) }),
              },
            }
          : {}),
      },
      include: { client: { select: { name: true, email: true } } },
      orderBy: { issueDate: 'asc' },
    });

    const header = 'Date,Num,Customer,Amount,Memo,Email';
    const rows = invoices.map((inv) => {
      const date = inv.issueDate.toISOString().slice(0, 10);
      const customer = (inv.client?.name || '').replace(/"/g, '""');
      const memo = (inv.notes || inv.documentNumber).replace(/"/g, '""');
      const email = inv.client?.email || '';
      return `${date},"${inv.documentNumber}","${customer}",${inv.total.toFixed(2)},"${memo}","${email}"`;
    });

    return {
      filename: `invoiceflow-export-${new Date().toISOString().slice(0, 10)}.csv`,
      content: [header, ...rows].join('\n'),
      count: invoices.length,
    };
  }
}
