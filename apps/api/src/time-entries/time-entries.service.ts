import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimeEntriesService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string, billableOnly?: boolean) {
    return this.prisma.timeEntry.findMany({
      where: {
        userId,
        ...(billableOnly && { billable: true, invoiced: false }),
      },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });
  }

  create(userId: string, data: {
    clientId?: string;
    description: string;
    hours: number;
    rate: number;
    date?: string;
    billable?: boolean;
  }) {
    return this.prisma.timeEntry.create({
      data: {
        userId,
        clientId: data.clientId,
        description: data.description,
        hours: data.hours,
        rate: data.rate,
        date: data.date ? new Date(data.date) : new Date(),
        billable: data.billable ?? true,
      },
      include: { client: true },
    });
  }

  async remove(userId: string, id: string) {
    const entry = await this.prisma.timeEntry.findFirst({ where: { id, userId } });
    if (!entry) throw new NotFoundException('Time entry not found');
    return this.prisma.timeEntry.delete({ where: { id } });
  }

  async toLineItems(userId: string, entryIds: string[]) {
    const entries = await this.prisma.timeEntry.findMany({
      where: { id: { in: entryIds }, userId, invoiced: false },
    });

    await this.prisma.timeEntry.updateMany({
      where: { id: { in: entryIds } },
      data: { invoiced: true },
    });

    return entries.map((e) => ({
      description: e.description,
      quantity: e.hours,
      unitPrice: e.rate,
      taxRate: 0,
      discount: 0,
    }));
  }
}
