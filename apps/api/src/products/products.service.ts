import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string, search?: string) {
    return this.prisma.product.findMany({
      where: {
        userId,
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
      },
      orderBy: { name: 'asc' },
    });
  }

  create(userId: string, data: { name: string; description?: string; unitPrice: number; taxRate?: number; sku?: string }) {
    return this.prisma.product.create({ data: { ...data, userId, taxRate: data.taxRate || 0 } });
  }

  async update(userId: string, id: string, data: Partial<{ name: string; description: string; unitPrice: number; taxRate: number; sku: string }>) {
    const p = await this.prisma.product.findFirst({ where: { id, userId } });
    if (!p) throw new NotFoundException('Product not found');
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    const p = await this.prisma.product.findFirst({ where: { id, userId } });
    if (!p) throw new NotFoundException('Product not found');
    return this.prisma.product.delete({ where: { id } });
  }
}
