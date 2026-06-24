import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string, from?: string, to?: string) {
    return this.prisma.expense.findMany({
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
      orderBy: { date: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({ where: { id, userId } });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  create(userId: string, data: {
    description: string;
    amount: number;
    category?: string;
    date?: string;
    receiptUrl?: string;
    vendor?: string;
    taxDeductible?: boolean;
  }) {
    return this.prisma.expense.create({
      data: {
        userId,
        description: data.description,
        amount: data.amount,
        category: data.category || 'General',
        date: data.date ? new Date(data.date) : new Date(),
        receiptUrl: data.receiptUrl,
        vendor: data.vendor,
        taxDeductible: data.taxDeductible ?? true,
      },
    });
  }

  async update(userId: string, id: string, data: Partial<{
    description: string;
    amount: number;
    category: string;
    date: string;
    receiptUrl: string;
    vendor: string;
    taxDeductible: boolean;
  }>) {
    await this.findOne(userId, id);
    return this.prisma.expense.update({
      where: { id },
      data: {
        ...data,
        ...(data.date && { date: new Date(data.date) }),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.expense.delete({ where: { id } });
  }

  async getSummary(userId: string, from?: string, to?: string) {
    const expenses = await this.findAll(userId, from, to);
    const byCategory: Record<string, number> = {};
    for (const e of expenses) {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    }
    return {
      total: expenses.reduce((s, e) => s + e.amount, 0),
      count: expenses.length,
      byCategory,
    };
  }
}
