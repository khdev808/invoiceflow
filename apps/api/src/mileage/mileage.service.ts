import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MileageService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.mileageEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async getSummary(userId: string) {
    const entries = await this.findAll(userId);
    return {
      totalMiles: entries.reduce((s, e) => s + e.miles, 0),
      totalDeduction: entries.reduce((s, e) => s + e.miles * e.rate, 0),
      count: entries.length,
    };
  }

  create(userId: string, data: { description: string; miles: number; rate?: number; date?: string }) {
    return this.prisma.mileageEntry.create({
      data: {
        userId,
        description: data.description,
        miles: data.miles,
        rate: data.rate ?? 0.67,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });
  }

  async remove(userId: string, id: string) {
    const e = await this.prisma.mileageEntry.findFirst({ where: { id, userId } });
    if (!e) throw new NotFoundException('Mileage entry not found');
    return this.prisma.mileageEntry.delete({ where: { id } });
  }
}
