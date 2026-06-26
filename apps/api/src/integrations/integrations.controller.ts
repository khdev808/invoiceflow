import { Controller, Put, Body, UseGuards, Request } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { AppUserGuard } from '../auth/guards';
import { PrismaService } from '../prisma/prisma.service';

@Controller('integrations')
@UseGuards(AppUserGuard)
export class IntegrationsController {
  constructor(
    private integrations: IntegrationsService,
    private prisma: PrismaService,
  ) {}

  @Put('webhook')
  async setWebhook(@Request() req: { user: { userId: string } }, @Body() body: { url: string }) {
    return this.prisma.userSettings.update({
      where: { userId: req.user.userId },
      data: { webhookUrl: body.url },
    });
  }

  @Put('test')
  async test(@Request() req: { user: { userId: string } }) {
    await this.integrations.dispatch(req.user.userId, 'integration.test', { ok: true });
    return { sent: true };
  }
}
