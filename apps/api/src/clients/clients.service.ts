import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string, search?: string) {
    return this.prisma.client.findMany({
      where: {
        userId,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { invoices: true } },
      },
    });
  }

  async findOne(userId: string, id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, userId },
      include: {
        invoices: { orderBy: { createdAt: 'desc' }, take: 20 },
        timeEntries: { orderBy: { date: 'desc' }, take: 10 },
      },
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  create(userId: string, dto: CreateClientDto) {
    return this.prisma.client.create({ data: { ...dto, userId } });
  }

  async update(userId: string, id: string, dto: UpdateClientDto) {
    await this.findOne(userId, id);
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.client.delete({ where: { id } });
  }
}
