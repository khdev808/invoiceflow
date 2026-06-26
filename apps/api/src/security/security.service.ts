import {
  Injectable,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaptchaService } from './captcha.service';
import {
  TEMP_LOCK_THRESHOLD,
  PERM_LOCK_THRESHOLD,
  TEMP_LOCK_MINUTES,
  IP_TEMP_THRESHOLD,
  IP_BLOCK_HOURS,
  IP_FAILURE_WINDOW_MINUTES,
} from './security.constants';

export type AuthContext = 'app' | 'admin';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    private prisma: PrismaService,
    private captcha: CaptchaService,
  ) {}

  async verifyCaptchaForAuth(captchaToken: string | undefined, ip: string): Promise<void> {
    await this.captcha.verify(captchaToken, ip);
  }

  async assertAuthAllowed(ip: string, email?: string, userId?: string): Promise<void> {
    await this.assertIpAllowed(ip);
    if (email) await this.assertEmailAllowed(email);
    if (userId) await this.assertUserAllowed(userId);
  }

  async assertIpAllowed(ip: string): Promise<void> {
    const block = await this.getActiveBlock('ip', ip);
    if (block) {
      await this.logEvent('IP_BLOCKED_ATTEMPT', { ipAddress: ip, metadata: { blockId: block.id } });
      throw new ForbiddenException(
        block.scope === 'permanent'
          ? 'Access from this network is blocked.'
          : 'Too many attempts from this network. Try again later.',
      );
    }
  }

  async assertEmailAllowed(email: string): Promise<void> {
    const block = await this.getActiveBlock('email', email.toLowerCase());
    if (block) {
      throw new ForbiddenException('This account is blocked from signing in.');
    }
  }

  async assertUserAllowed(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;
    if (user.isBlocked) {
      throw new ForbiddenException(user.blockedReason || 'This account has been permanently blocked.');
    }
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new HttpException(
        `Account temporarily locked. Try again in ${mins} minute(s).`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async recordLoginSuccess(params: {
    userId: string;
    email: string;
    ip: string;
    userAgent: string;
    context: AuthContext;
  }): Promise<void> {
    await this.prisma.user.update({
      where: { id: params.userId },
      data: { failedLoginAttempts: 0, lockedUntil: null, lastFailedLoginAt: null },
    });
    await this.logEvent(params.context === 'admin' ? 'ADMIN_LOGIN_SUCCESS' : 'LOGIN_SUCCESS', {
      userId: params.userId,
      email: params.email,
      ipAddress: params.ip,
      userAgent: params.userAgent,
    });
  }

  async recordLoginFailure(params: {
    email: string;
    ip: string;
    userAgent: string;
    context: AuthContext;
    userId?: string;
  }): Promise<void> {
    await this.logEvent(params.context === 'admin' ? 'ADMIN_LOGIN_FAILED' : 'LOGIN_FAILED', {
      email: params.email,
      userId: params.userId,
      ipAddress: params.ip,
      userAgent: params.userAgent,
      metadata: { context: params.context },
    });

    if (params.userId) {
      const user = await this.prisma.user.update({
        where: { id: params.userId },
        data: {
          failedLoginAttempts: { increment: 1 },
          lastFailedLoginAt: new Date(),
        },
      });

      const attempts = user.failedLoginAttempts;

      if (attempts >= PERM_LOCK_THRESHOLD) {
        await this.blockUser(params.userId, 'Too many failed login attempts', 'system');
        await this.logEvent('USER_LOCKED_PERM', {
          userId: params.userId,
          email: params.email,
          ipAddress: params.ip,
          metadata: { attempts },
        });
      } else if (attempts >= TEMP_LOCK_THRESHOLD) {
        const lockedUntil = new Date(Date.now() + TEMP_LOCK_MINUTES * 60 * 1000);
        await this.prisma.user.update({
          where: { id: params.userId },
          data: { lockedUntil },
        });
        await this.logEvent('USER_LOCKED_TEMP', {
          userId: params.userId,
          email: params.email,
          ipAddress: params.ip,
          metadata: { attempts, lockedUntil: lockedUntil.toISOString() },
        });
      }
    }

    await this.maybeBlockIp(params.ip);
  }

  private async maybeBlockIp(ip: string): Promise<void> {
    if (ip === 'unknown') return;
    const since = new Date(Date.now() - IP_FAILURE_WINDOW_MINUTES * 60 * 1000);
    const failures = await this.prisma.securityEvent.count({
      where: {
        ipAddress: ip,
        eventType: { in: ['LOGIN_FAILED', 'ADMIN_LOGIN_FAILED', 'CAPTCHA_FAILED'] },
        createdAt: { gte: since },
      },
    });

    if (failures >= IP_TEMP_THRESHOLD) {
      const existing = await this.getActiveBlock('ip', ip);
      if (!existing) {
        const expiresAt = new Date(Date.now() + IP_BLOCK_HOURS * 60 * 60 * 1000);
        await this.prisma.securityBlock.create({
          data: {
            blockType: 'ip',
            value: ip,
            scope: 'temporary',
            reason: 'Automated block: excessive failed auth attempts',
            expiresAt,
            createdBy: 'system',
          },
        });
        await this.logEvent('IP_BLOCKED', { ipAddress: ip, metadata: { failures, expiresAt } });
        this.logger.warn(`Temporarily blocked IP ${ip} after ${failures} failures`);
      }
    }
  }

  async blockUser(userId: string, reason: string, createdBy: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: true,
        blockedReason: reason,
        blockedAt: new Date(),
        lockedUntil: null,
      },
    });
    await this.logEvent('USER_LOCKED_PERM', { userId, metadata: { reason, createdBy } });
  }

  async unblockUser(userId: string, adminId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: false,
        blockedReason: null,
        blockedAt: null,
        lockedUntil: null,
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
      },
    });
    await this.logEvent('USER_UNBLOCKED', { userId, metadata: { adminId } });
  }

  async createBlock(params: {
    blockType: 'ip' | 'email';
    value: string;
    scope: 'temporary' | 'permanent';
    reason?: string;
    hours?: number;
    createdBy: string;
  }) {
    const expiresAt =
      params.scope === 'temporary'
        ? new Date(Date.now() + (params.hours || IP_BLOCK_HOURS) * 60 * 60 * 1000)
        : null;

    const block = await this.prisma.securityBlock.upsert({
      where: { blockType_value: { blockType: params.blockType, value: params.value } },
      create: {
        blockType: params.blockType,
        value: params.value,
        scope: params.scope,
        reason: params.reason,
        expiresAt,
        createdBy: params.createdBy,
      },
      update: {
        scope: params.scope,
        reason: params.reason,
        expiresAt,
        createdBy: params.createdBy,
      },
    });

    await this.logEvent('IP_BLOCKED', {
      ipAddress: params.blockType === 'ip' ? params.value : undefined,
      email: params.blockType === 'email' ? params.value : undefined,
      metadata: { blockId: block.id, scope: params.scope, adminId: params.createdBy },
    });

    return block;
  }

  async removeBlock(blockId: string, adminId: string): Promise<void> {
    const block = await this.prisma.securityBlock.findUnique({ where: { id: blockId } });
    if (!block) return;
    await this.prisma.securityBlock.delete({ where: { id: blockId } });
    await this.logEvent('BLOCK_REMOVED', {
      metadata: { blockId, blockType: block.blockType, value: block.value, adminId },
    });
  }

  async listBlocks() {
    await this.pruneExpiredBlocks();
    return this.prisma.securityBlock.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  }

  async listEvents(limit = 50) {
    return this.prisma.securityEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(100, limit),
    });
  }

  private async getActiveBlock(blockType: string, value: string) {
    await this.pruneExpiredBlocks();
    const block = await this.prisma.securityBlock.findUnique({
      where: { blockType_value: { blockType, value } },
    });
    if (!block) return null;
    if (block.scope === 'temporary' && block.expiresAt && block.expiresAt < new Date()) {
      await this.prisma.securityBlock.delete({ where: { id: block.id } });
      return null;
    }
    return block;
  }

  private async pruneExpiredBlocks(): Promise<void> {
    await this.prisma.securityBlock.deleteMany({
      where: { scope: 'temporary', expiresAt: { lt: new Date() } },
    });
  }

  async logEvent(
    eventType: string,
    params: {
      email?: string;
      userId?: string;
      ipAddress?: string;
      userAgent?: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<void> {
    await this.prisma.securityEvent.create({
      data: {
        eventType,
        email: params.email,
        userId: params.userId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata: (params.metadata ?? undefined) as object | undefined,
      },
    });
  }

  async logCaptchaFailure(ip: string, email?: string): Promise<void> {
    await this.logEvent('CAPTCHA_FAILED', { ipAddress: ip, email });
    await this.maybeBlockIp(ip);
  }
}
