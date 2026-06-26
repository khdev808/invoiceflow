import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MileageService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string, unbilledOnly?: boolean) {
    return this.prisma.mileageEntry.findMany({
      where: {
        userId,
        ...(unbilledOnly && { invoiced: false }),
      },
      orderBy: { date: 'desc' },
    });
  }

  async getSummary(userId: string) {
    const settings = await this.prisma.userSettings.findUnique({ where: { userId } });
    const defaultRate = settings?.mileageRate ?? 0.67;
    const entries = await this.findAll(userId);
    const totalDeduction = entries.reduce((s, e) => s + e.miles * e.rate, 0);
    return {
      totalMiles: entries.reduce((s, e) => s + e.miles, 0),
      totalDeduction,
      totalAmount: totalDeduction,
      unbilledMiles: entries.filter((e) => !e.invoiced).reduce((s, e) => s + e.miles, 0),
      unbilledDeduction: entries.filter((e) => !e.invoiced).reduce((s, e) => s + e.miles * e.rate, 0),
      defaultRate,
      count: entries.length,
    };
  }

  async create(userId: string, data: { description: string; miles: number; rate?: number; date?: string }) {
    const settings = await this.prisma.userSettings.findUnique({ where: { userId } });
    const defaultRate = settings?.mileageRate ?? 0.67;
    return this.prisma.mileageEntry.create({
      data: {
        userId,
        description: data.description,
        miles: data.miles,
        rate: data.rate ?? defaultRate,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });
  }

  async remove(userId: string, id: string) {
    const e = await this.prisma.mileageEntry.findFirst({ where: { id, userId } });
    if (!e) throw new NotFoundException('Mileage entry not found');
    return this.prisma.mileageEntry.delete({ where: { id } });
  }

  async toLineItems(userId: string, entryIds: string[]) {
    const entries = await this.prisma.mileageEntry.findMany({
      where: { id: { in: entryIds }, userId, invoiced: false },
    });

    await this.prisma.mileageEntry.updateMany({
      where: { id: { in: entryIds } },
      data: { invoiced: true },
    });

    return entries.map((e) => ({
      description: `Mileage: ${e.description} (${e.miles} mi)`,
      quantity: 1,
      unitPrice: e.miles * e.rate,
      taxRate: 0,
      discount: 0,
    }));
  }
}
