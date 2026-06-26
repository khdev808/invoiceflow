import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { calcInvoiceTotals, calcLineTotal } from './invoice.utils';
import { DocumentType, InvoiceStatus } from '../generated/prisma/client';
import { EmailService } from '../email/email.service';
import { PlanService } from '../plan/plan.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { NotificationsService } from '../notifications/notifications.service';
import { getDepositDue } from '../payments/payment.utils';
import { getPortalBase } from '../config/portal-url';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private plan: PlanService,
    private integrations: IntegrationsService,
    private notifications: NotificationsService,
  ) {}

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
            plan: true,
          },
        },
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === 'DRAFT' || invoice.status === 'CANCELLED') {
      throw new NotFoundException('Invoice not found');
    }
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
    if ((dto.documentType || 'INVOICE') === 'INVOICE') {
      try {
        await this.plan.checkInvoiceLimit(userId);
      } catch (e: any) {
        throw new ForbiddenException(e.message);
      }
    }
    const settings = await this.prisma.userSettings.findUnique({ where: { userId } });
    const templateId = dto.templateId || settings?.templateId || 'modern';
    if (!['modern', 'minimal'].includes(templateId)) {
      try {
        await this.plan.checkFeature(userId, 'premiumTemplates');
      } catch (e: any) {
        throw new ForbiddenException(e.message);
      }
    }

    const docType = (dto.documentType || 'INVOICE') as DocumentType;
    let totals = calcInvoiceTotals(dto.lineItems);
    if (docType === 'CREDIT_NOTE') {
      totals = {
        subtotal: -Math.abs(totals.subtotal),
        taxTotal: -Math.abs(totals.taxTotal),
        discountTotal: totals.discountTotal,
        total: -Math.abs(totals.total),
      };
    }
    const documentNumber = await this.nextDocNumber(userId, docType === 'CREDIT_NOTE' ? 'INVOICE' : docType);

    const paymentTerms = settings?.defaultPaymentTerms ?? 30;
    const dueDate = dto.dueDate
      ? new Date(dto.dueDate)
      : docType === 'INVOICE' || docType === 'ESTIMATE'
        ? (() => { const d = new Date(); d.setDate(d.getDate() + paymentTerms); return d; })()
        : undefined;

    const invoice = await this.prisma.invoice.create({
      data: {
        userId,
        clientId: dto.clientId,
        documentNumber: docType === 'CREDIT_NOTE' ? `CN-${documentNumber}` : documentNumber,
        documentType: docType,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : new Date(),
        dueDate,
        currency: dto.currency || 'USD',
        notes: dto.notes,
        terms: dto.terms,
        signature: dto.signature,
        templateId,
        recurringRule: dto.recurringRule,
        depositAmount: dto.depositAmount,
        depositPercent: dto.depositPercent,
        linkedInvoiceId: dto.linkedInvoiceId,
        ...totals,
        lineItems: {
          create: dto.lineItems.map((item, i) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: docType === 'CREDIT_NOTE' ? -Math.abs(item.unitPrice) : item.unitPrice,
            taxRate: item.taxRate || 0,
            discount: item.discount || 0,
            total: docType === 'CREDIT_NOTE' ? -Math.abs(calcLineTotal(item)) : calcLineTotal(item),
            sortOrder: i,
          })),
        },
      },
      include: { client: true, lineItems: true },
    });

    if (docType === 'CREDIT_NOTE' && dto.linkedInvoiceId) {
      await this.applyCreditToInvoice(userId, dto.linkedInvoiceId, Math.abs(totals.total));
    }

    if (dto.recurringRule) {
      const nextRun = this.nextRunFromFrequency(dto.recurringRule);
      await this.prisma.recurringSchedule.create({
        data: {
          userId,
          templateInvoiceId: invoice.id,
          clientId: dto.clientId,
          frequency: dto.recurringRule,
          nextRunAt: nextRun,
          lineItemsJson: dto.lineItems as unknown as object,
          notes: dto.notes,
        },
      });
    }

    return invoice;
  }

  async update(userId: string, id: string, dto: UpdateInvoiceDto) {
    const existing = await this.findOne(userId, id);
    if (existing.status === 'PAID') throw new BadRequestException('Cannot edit paid invoice');

    if (dto.templateId && !['modern', 'minimal'].includes(dto.templateId)) {
      try {
        await this.plan.checkFeature(userId, 'premiumTemplates');
      } catch (e: any) {
        throw new ForbiddenException(e.message);
      }
    }

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
        ...(dto.depositAmount !== undefined && { depositAmount: dto.depositAmount }),
        ...(dto.depositPercent !== undefined && { depositPercent: dto.depositPercent }),
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
    const portalBase = getPortalBase();
    const portalUrl = `${portalBase}/${id}`;

    if (invoice.client.email) {
      await this.email.sendInvoiceEmail({
        to: invoice.client.email,
        clientName: invoice.client.name,
        documentNumber: invoice.documentNumber,
        total: invoice.total,
        currency: invoice.currency,
        portalUrl,
        businessName: invoice.user?.businessName || invoice.user?.name || 'InvoiceFlow',
      });
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date() },
      include: { client: true, lineItems: true },
    });

    await this.prisma.invoiceActivity.create({
      data: { invoiceId: id, action: 'SENT', metadata: { email: invoice.client.email } },
    });

    await this.notifications.notify(userId, {
      title: 'Invoice Sent',
      body: `${invoice.documentNumber} sent to ${invoice.client.name}`,
      type: 'invoice_sent',
      data: { invoiceId: id },
    });

    await this.integrations.dispatch(userId, 'invoice.sent', { invoiceId: id, documentNumber: invoice.documentNumber });

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

    await this.notifications.notify(invoice.userId, {
      title: 'Invoice Opened',
      body: `${invoice.client.name} opened ${invoice.documentNumber}`,
      type: 'invoice_viewed',
      data: { invoiceId: id },
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
    const depositDue = getDepositDue(invoice!);
    const updates: Record<string, unknown> = {};

    if (depositDue > 0 && !invoice!.depositPaid && amount >= depositDue) {
      updates.depositPaid = true;
    }
    if (paidTotal >= invoice!.total) {
      updates.status = 'PAID';
      updates.paidAt = new Date();
    }

    if (Object.keys(updates).length > 0) {
      await this.prisma.invoice.update({ where: { id: invoiceId }, data: updates });
    }

    await this.notifications.notify(userId, {
      title: 'Payment Received',
      body: `$${amount.toFixed(2)} received for ${invoice!.documentNumber}`,
      type: 'payment_received',
      data: { invoiceId, paymentId: payment.id },
    });

    return payment;
  }

  async clientSign(id: string, signature: string, signerName?: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id }, include: { client: true } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { clientSignature: signature, status: invoice.documentType === 'ESTIMATE' ? 'VIEWED' : invoice.status },
    });

    await this.prisma.invoiceActivity.create({
      data: { invoiceId: id, action: 'CLIENT_SIGNED', metadata: { signerName } },
    });

    await this.notifications.notify(invoice.userId, {
      title: 'Client Signed',
      body: `${signerName || invoice.client.name} signed ${invoice.documentNumber}`,
      type: 'client_signed',
      data: { invoiceId: id },
    });

    return updated;
  }

  async listRecurring(userId: string) {
    return this.prisma.recurringSchedule.findMany({
      where: { userId },
      orderBy: { nextRunAt: 'asc' },
    });
  }

  async toggleRecurring(userId: string, id: string, active: boolean) {
    const schedule = await this.prisma.recurringSchedule.findFirst({ where: { id, userId } });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return this.prisma.recurringSchedule.update({ where: { id }, data: { active } });
  }

  async deleteRecurring(userId: string, id: string) {
    const schedule = await this.prisma.recurringSchedule.findFirst({ where: { id, userId } });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return this.prisma.recurringSchedule.delete({ where: { id } });
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

  private nextRunFromFrequency(frequency: string) {
    const d = new Date();
    switch (frequency) {
      case 'weekly':
        d.setDate(d.getDate() + 7);
        break;
      case 'quarterly':
        d.setMonth(d.getMonth() + 3);
        break;
      case 'yearly':
        d.setFullYear(d.getFullYear() + 1);
        break;
      default:
        d.setMonth(d.getMonth() + 1);
    }
    return d;
  }

  private async applyCreditToInvoice(userId: string, linkedInvoiceId: string, creditAmount: number) {
    const linked = await this.prisma.invoice.findFirst({
      where: { id: linkedInvoiceId, userId, documentType: 'INVOICE' },
      include: { payments: true },
    });
    if (!linked || linked.status === 'PAID' || linked.status === 'CANCELLED') return;

    const paidSoFar = linked.payments.reduce((s, p) => s + p.amount, 0);
    const balance = linked.total + linked.lateFeeAmount - paidSoFar;
    const applied = Math.min(creditAmount, Math.max(0, balance));

    if (applied <= 0) return;

    await this.prisma.payment.create({
      data: {
        invoiceId: linkedInvoiceId,
        amount: applied,
        method: 'BANK_TRANSFER',
        notes: 'Applied from credit note',
      },
    });

    const newPaid = paidSoFar + applied;
    const newTotal = linked.total + linked.lateFeeAmount;
    if (newPaid >= newTotal - 0.01) {
      await this.prisma.invoice.update({
        where: { id: linkedInvoiceId },
        data: { status: 'PAID', paidAt: new Date() },
      });
    }

    await this.prisma.invoiceActivity.create({
      data: {
        invoiceId: linkedInvoiceId,
        action: 'CREDIT_APPLIED',
        metadata: { creditAmount: applied },
      },
    });
  }
}
