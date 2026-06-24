import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateProfile(userId: string, data: Partial<{
    name: string;
    businessName: string;
    businessLogo: string;
    businessPhone: string;
    businessEmail: string;
    businessAddress: string;
    taxId: string;
    currency: string;
    language: string;
    timezone: string;
  }>) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        businessLogo: true,
        businessPhone: true,
        businessEmail: true,
        businessAddress: true,
        taxId: true,
        currency: true,
        language: true,
        timezone: true,
      },
    });
  }

  async updateSettings(userId: string, data: Partial<{
    defaultTaxRate: number;
    defaultPaymentTerms: number;
    invoicePrefix: string;
    estimatePrefix: string;
    templateId: string;
    primaryColor: string;
    enableOpenTracking: boolean;
    enablePaymentReminders: boolean;
    reminderDaysBefore: number;
    reminderDaysAfter: number;
    enableLateFees: boolean;
    lateFeePercent: number;
  }>) {
    return this.prisma.userSettings.update({
      where: { userId },
      data,
    });
  }
}
