import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { calcInvoiceTotals, calcLineTotal } from './invoice.utils';
import { DocumentType, InvoiceStatus } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, filters?: { status?: string; type?: string; clientId?: string }) {
    return this.prisma.invoice.findMany({
      where: {
        userId,
        ...(filters?.status && { status: filters.status as InvoiceStatus }),
        ...(filters?.type && { documentType: filters.type as DocumentType }),
        ...(filters?.clientId && { clientId: filters.clientId }),
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        lineItems: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { payments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPublic(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        lineItems: { orderBy: { sortOrder: 'asc' } },
        user: {
          select: {
            businessName: true,
            businessLogo: true,
            businessPhone: true,
            businessEmail: true,
            businessAddress: true,
            taxId: true,
            name: true,
          },
        },
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async findOne(userId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, userId },
      include: {
        client: true,
        lineItems: { orderBy: { sortOrder: 'asc' } },
        payments: { orderBy: { paidAt: 'desc' } },
        activities: { orderBy: { createdAt: 'desc' } },
        user: {
          select: {
            name: true,
            businessName: true,
            businessLogo: true,
            businessPhone: true,
            businessEmail: true,
            businessAddress: true,
            taxId: true,
          },
        },
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  private async nextDocNumber(userId: string, type: DocumentType) {
    const settings = await this.prisma.userSettings.findUnique({ where: { userId } });
    if (!settings) throw new BadRequestException('User settings not found');

    const isEstimate = type === 'ESTIMATE';
    const prefix = isEstimate ? settings.estimatePrefix : settings.invoicePrefix;
    const number = isEstimate ? settings.nextEstimateNumber : settings.nextInvoiceNumber;

    await this.prisma.userSettings.update({
      where: { userId },
      data: isEstimate
        ? { nextEstimateNumber: number + 1 }
        : { nextInvoiceNumber: number + 1 },
    });

    return `${prefix}-${number}`;
  }

  async create(userId: string, dto: CreateInvoiceDto) {
    const docType = (dto.documentType || 'INVOICE') as DocumentType;
    const totals = calcInvoiceTotals(dto.lineItems);
    const documentNumber = await this.nextDocNumber(userId, docType);

    return this.prisma.invoice.create({
      data: {
        userId,
        clientId: dto.clientId,
        documentNumber,
        documentType: docType,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : new Date(),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        currency: dto.currency || 'USD',
        notes: dto.notes,
        terms: dto.terms,
        signature: dto.signature,
        templateId: dto.templateId || 'modern',
        recurringRule: dto.recurringRule,
        ...totals,
        lineItems: {
          create: dto.lineItems.map((item, i) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate || 0,
            discount: item.discount || 0,
            total: calcLineTotal(item),
            sortOrder: i,
          })),
        },
      },
      include: { client: true, lineItems: true },
    });
  }

  async update(userId: string, id: string, dto: UpdateInvoiceDto) {
    const existing = await this.findOne(userId, id);
    if (existing.status === 'PAID') throw new BadRequestException('Cannot edit paid invoice');

    const totals = dto.lineItems ? calcInvoiceTotals(dto.lineItems) : {};

    await this.prisma.lineItem.deleteMany({ where: { invoiceId: id } });

    return this.prisma.invoice.update({
      where: { id },
      data: {
        ...(dto.clientId && { clientId: dto.clientId }),
        ...(dto.status && { status: dto.status as InvoiceStatus }),
        ...(dto.issueDate && { issueDate: new Date(dto.issueDate) }),
        ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.terms !== undefined && { terms: dto.terms }),
        ...(dto.signature !== undefined && { signature: dto.signature }),
        ...(dto.templateId && { templateId: dto.templateId }),
        ...totals,
        ...(dto.lineItems && {
          lineItems: {
            create: dto.lineItems.map((item, i) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate || 0,
              discount: item.discount || 0,
              total: calcLineTotal(item),
              sortOrder: i,
            })),
          },
        }),
      },
      include: { client: true, lineItems: true },
    });
  }

  async send(userId: string, id: string) {
    const invoice = await this.findOne(userId, id);
    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date() },
      include: { client: true, lineItems: true },
    });

    await this.prisma.invoiceActivity.create({
      data: { invoiceId: id, action: 'SENT', metadata: { email: invoice.client.email } },
    });

    await this.prisma.notification.create({
      data: {
        userId,
        title: 'Invoice Sent',
        body: `${invoice.documentNumber} sent to ${invoice.client.name}`,
        type: 'invoice_sent',
        data: { invoiceId: id },
      },
    });

    return updated;
  }

  async markViewed(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { client: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status: invoice.status === 'SENT' ? 'VIEWED' : invoice.status, viewedAt: new Date() },
    });

    await this.prisma.invoiceActivity.create({
      data: { invoiceId: id, action: 'VIEWED' },
    });

    await this.prisma.notification.create({
      data: {
        userId: invoice.userId,
        title: 'Invoice Opened',
        body: `${invoice.client.name} opened ${invoice.documentNumber}`,
        type: 'invoice_viewed',
        data: { invoiceId: id },
      },
    });

    return updated;
  }

  async convertEstimate(userId: string, estimateId: string, dueDate?: string) {
    const estimate = await this.findOne(userId, estimateId);
    if (estimate.documentType !== 'ESTIMATE') throw new BadRequestException('Not an estimate');

    const documentNumber = await this.nextDocNumber(userId, 'INVOICE');

    return this.prisma.invoice.create({
      data: {
        userId,
        clientId: estimate.clientId,
        documentNumber,
        documentType: 'INVOICE',
        convertedFromId: estimateId,
        issueDate: new Date(),
        dueDate: dueDate ? new Date(dueDate) : estimate.dueDate,
        currency: estimate.currency,
        subtotal: estimate.subtotal,
        taxTotal: estimate.taxTotal,
        discountTotal: estimate.discountTotal,
        total: estimate.total,
        notes: estimate.notes,
        terms: estimate.terms,
        signature: estimate.signature,
        templateId: estimate.templateId,
        lineItems: {
          create: estimate.lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            discount: item.discount,
            total: item.total,
            sortOrder: item.sortOrder,
          })),
        },
      },
      include: { client: true, lineItems: true },
    });
  }

  async recordPayment(userId: string, invoiceId: string, amount: number, method: string, transactionId?: string) {
    await this.findOne(userId, invoiceId);

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId,
        amount,
        method: method as any,
        transactionId,
      },
    });

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    const paidTotal = invoice!.payments.reduce((s, p) => s + p.amount, 0);
    if (paidTotal >= invoice!.total) {
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'PAID', paidAt: new Date() },
      });
    }

    await this.prisma.notification.create({
      data: {
        userId,
        title: 'Payment Received',
        body: `$${amount.toFixed(2)} received for ${invoice!.documentNumber}`,
        type: 'payment_received',
        data: { invoiceId, paymentId: payment.id },
      },
    });

    return payment;
  }

  async remove(userId: string, id: string) {
    const invoice = await this.findOne(userId, id);
    if (invoice.status === 'PAID') throw new BadRequestException('Cannot delete paid invoice');
    return this.prisma.invoice.delete({ where: { id } });
  }

  async getDashboardStats(userId: string) {
    const [invoices, expenses, clients] = await Promise.all([
      this.prisma.invoice.findMany({ where: { userId, documentType: 'INVOICE' } }),
      this.prisma.expense.findMany({ where: { userId } }),
      this.prisma.client.count({ where: { userId } }),
    ]);

    const paid = invoices.filter((i) => i.status === 'PAID');
    const outstanding = invoices.filter((i) => ['SENT', 'VIEWED', 'OVERDUE'].includes(i.status));
    const overdue = invoices.filter((i) => i.status === 'OVERDUE');

    return {
      totalRevenue: paid.reduce((s, i) => s + i.total, 0),
      outstandingAmount: outstanding.reduce((s, i) => s + i.total, 0),
      overdueAmount: overdue.reduce((s, i) => s + i.total, 0),
      totalExpenses: expenses.reduce((s, e) => s + e.amount, 0),
      invoiceCount: invoices.length,
      paidCount: paid.length,
      outstandingCount: outstanding.length,
      overdueCount: overdue.length,
      clientCount: clients,
      estimatesPending: await this.prisma.invoice.count({
        where: { userId, documentType: 'ESTIMATE', status: { in: ['DRAFT', 'SENT'] } },
      }),
    };
  }
}
