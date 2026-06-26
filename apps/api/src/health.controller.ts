import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from './prisma/prisma.service';

@SkipThrottle()
@Controller()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  async health() {
    const ts = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true, db: true, ts };
    } catch {
      throw new ServiceUnavailableException({ ok: false, db: false, ts });
    }
  }
}
