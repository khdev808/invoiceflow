import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { InvoicesService } from '../invoices/invoices.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  private portalBase = process.env.PORTAL_URL || 'http://localhost:3000/portal';

  constructor(
    private prisma: PrismaService,
    private invoices: InvoicesService,
    private email: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async markOverdueInvoices() {
    const now = new Date();
    const result = await this.prisma.invoice.updateMany({
      where: {
        documentType: 'INVOICE',
        status: { in: ['SENT', 'VIEWED'] },
        dueDate: { lt: now },
      },
      data: { status: 'OVERDUE' },
    });
    if (result.count > 0) this.logger.log(`Marked ${result.count} invoices overdue`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async applyLateFees() {
    const overdue = await this.prisma.invoice.findMany({
      where: { status: 'OVERDUE', lateFeeAmount: 0, documentType: 'INVOICE' },
      include: { user: { include: { settings: true } } },
    });

    for (const inv of overdue) {
      const settings = inv.user.settings;
      if (!settings?.enableLateFees || settings.lateFeePercent <= 0) continue;

      const fee = Math.round(inv.total * (settings.lateFeePercent / 100) * 100) / 100;
      await this.prisma.invoice.update({
        where: { id: inv.id },
        data: { lateFeeAmount: fee, total: inv.total + fee },
      });
      await this.prisma.invoiceActivity.create({
        data: { invoiceId: inv.id, action: 'LATE_FEE_APPLIED', metadata: { amount: fee } },
      });
      await this.prisma.notification.create({
        data: {
          userId: inv.userId,
          title: 'Late Fee Applied',
          body: `$${fee.toFixed(2)} late fee added to ${inv.documentNumber}`,
          type: 'late_fee',
          data: { invoiceId: inv.id },
        },
      });
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendPaymentReminders() {
    const users = await this.prisma.user.findMany({
      where: { settings: { enablePaymentReminders: true } },
      include: { settings: true },
    });

    const now = new Date();
    for (const user of users) {
      const settings = user.settings!;
      const beforeDate = new Date(now);
      beforeDate.setDate(beforeDate.getDate() + settings.reminderDaysBefore);
      const afterDate = new Date(now);
      afterDate.setDate(afterDate.getDate() - settings.reminderDaysAfter);

      const dueSoon = await this.prisma.invoice.findMany({
        where: {
          userId: user.id,
          status: { in: ['SENT', 'VIEWED'] },
          dueDate: { gte: now, lte: beforeDate },
          reminderSentAt: null,
        },
        include: { client: true },
      });

      for (const inv of dueSoon) {
        if (inv.client.email) {
          await this.email.sendReminderEmail({
            to: inv.client.email,
            clientName: inv.client.name,
            documentNumber: inv.documentNumber,
            total: inv.total,
            dueDate: inv.dueDate ?? undefined,
            portalUrl: `${this.portalBase}/${inv.id}`,
            overdue: false,
          });
        }
        await this.prisma.notification.create({
          data: {
            userId: user.id,
            title: 'Payment Reminder Sent',
            body: `Reminder sent for ${inv.documentNumber} to ${inv.client.name}`,
            type: 'reminder',
            data: { invoiceId: inv.id },
          },
        });
        await this.prisma.invoice.update({
          where: { id: inv.id },
          data: { reminderSentAt: now, lastReminderAt: now },
        });
        await this.prisma.invoiceActivity.create({
          data: { invoiceId: inv.id, action: 'REMINDER_SENT', metadata: { type: 'before_due' } },
        });
      }

      const overdue = await this.prisma.invoice.findMany({
        where: {
          userId: user.id,
          status: 'OVERDUE',
          dueDate: { lte: afterDate },
          OR: [{ lastReminderAt: null }, { lastReminderAt: { lt: new Date(now.getTime() - 7 * 86400000) } }],
        },
        include: { client: true },
      });

      for (const inv of overdue) {
        if (inv.client.email) {
          await this.email.sendReminderEmail({
            to: inv.client.email,
            clientName: inv.client.name,
            documentNumber: inv.documentNumber,
            total: inv.total,
            dueDate: inv.dueDate ?? undefined,
            portalUrl: `${this.portalBase}/${inv.id}`,
            overdue: true,
          });
        }
        await this.prisma.notification.create({
          data: {
            userId: user.id,
            title: 'Overdue Reminder Sent',
            body: `Overdue reminder for ${inv.documentNumber}`,
            type: 'reminder_overdue',
            data: { invoiceId: inv.id },
          },
        });
        await this.prisma.invoice.update({
          where: { id: inv.id },
          data: { lastReminderAt: now },
        });
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processRecurringInvoices() {
    const schedules = await this.prisma.recurringSchedule.findMany({
      where: { active: true, nextRunAt: { lte: new Date() } },
    });

    for (const schedule of schedules) {
      const lineItems = schedule.lineItemsJson as unknown as Array<{
        description: string; quantity: number; unitPrice: number; taxRate?: number; discount?: number;
      }>;

      await this.invoices.create(schedule.userId, {
        clientId: schedule.clientId,
        documentType: 'INVOICE',
        notes: schedule.notes || undefined,
        lineItems,
      });

      const next = new Date(schedule.nextRunAt);
      switch (schedule.frequency) {
        case 'weekly': next.setDate(next.getDate() + 7); break;
        case 'quarterly': next.setMonth(next.getMonth() + 3); break;
        case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
        default: next.setMonth(next.getMonth() + 1);
      }

      await this.prisma.recurringSchedule.update({
        where: { id: schedule.id },
        data: { nextRunAt: next },
      });

      await this.prisma.notification.create({
        data: {
          userId: schedule.userId,
          title: 'Recurring Invoice Created',
          body: `Auto-generated invoice from recurring schedule`,
          type: 'recurring',
        },
      });
    }
  }
}
