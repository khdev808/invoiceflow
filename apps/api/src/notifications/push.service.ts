import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(private prisma: PrismaService) {}

  async sendToUser(userId: string, title: string, body: string, data?: Record<string, unknown>) {
    const settings = await this.prisma.userSettings.findUnique({ where: { userId } });
    if (!settings?.pushToken) return { sent: false, reason: 'no_token' };

    try {
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          to: settings.pushToken,
          title,
          body,
          data: data || {},
          sound: 'default',
        }),
      });
      const json = await res.json();
      return { sent: true, result: json };
    } catch (e) {
      this.logger.warn(`Push failed for ${userId}: ${e}`);
      return { sent: false, error: String(e) };
    }
  }
}
