import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(private prisma: PrismaService) {}

  async dispatch(userId: string, event: string, payload: Record<string, unknown>) {
    const settings = await this.prisma.userSettings.findUnique({ where: { userId } });
    if (!settings?.webhookUrl) return;

    try {
      await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, payload, timestamp: new Date().toISOString() }),
      });
    } catch (e) {
      this.logger.warn(`Webhook dispatch failed for user ${userId}: ${e}`);
    }
  }
}
