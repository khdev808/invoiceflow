import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { SecurityService } from '../security/security.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { ReferralsService } from '../referrals/referrals.service';

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private email: EmailService,
    private config: ConfigService,
    private security: SecurityService,
    private referrals: ReferralsService,
  ) {}

  async register(dto: RegisterDto, ip: string, userAgent: string, mobileAppKey?: string) {
    try {
      await this.security.verifyCaptchaForAuth(dto.captchaToken, ip, mobileAppKey);
    } catch (e) {
      await this.security.logCaptchaFailure(ip, dto.email);
      throw e;
    }

    await this.security.assertAuthAllowed(ip, dto.email);

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    let referralCode = generateReferralCode();
    for (let i = 0; i < 5; i++) {
      const taken = await this.prisma.user.findUnique({ where: { referralCode } });
      if (!taken) break;
      referralCode = generateReferralCode();
    }

    const referredByUserId = dto.referralCode
      ? await this.referrals.resolveReferrerId(dto.referralCode)
      : null;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        businessName: dto.businessName,
        role: 'USER',
        referralCode,
        referredByUserId,
        settings: { create: {} },
      },
      select: { id: true, email: true, name: true, role: true, businessName: true, referralCode: true },
    });

    if (referredByUserId) {
      await this.referrals.onReferralSignup(referredByUserId, user.id, user.name);
    }

    const token = this.signAppToken(user.id, user.email, user.role);
    await this.security.logEvent('REGISTER_SUCCESS', {
      userId: user.id,
      email: user.email,
      ipAddress: ip,
      userAgent,
    });
    return { user, token };
  }

  async login(dto: LoginDto, ip: string, userAgent: string, mobileAppKey?: string) {
    try {
      await this.security.verifyCaptchaForAuth(dto.captchaToken, ip, mobileAppKey);
    } catch (e) {
      await this.security.logCaptchaFailure(ip, dto.email);
      throw e;
    }

    await this.security.assertAuthAllowed(ip, dto.email);

    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user) {
      await this.security.recordLoginFailure({ email: dto.email, ip, userAgent, context: 'app' });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role === 'ADMIN') {
      await this.security.recordLoginFailure({
        email: dto.email,
        ip,
        userAgent,
        context: 'app',
        userId: user.id,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.security.assertUserAllowed(user.id);

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.security.recordLoginFailure({
        email: dto.email,
        ip,
        userAgent,
        context: 'app',
        userId: user.id,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.security.recordLoginSuccess({
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
      context: 'app',
    });

    const token = this.signAppToken(user.id, user.email, user.role);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        businessName: user.businessName,
      },
      token,
    };
  }

  async forgotPassword(email: string, captchaToken: string | undefined, ip: string) {
    try {
      await this.security.verifyCaptchaForAuth(captchaToken, ip);
    } catch (e) {
      await this.security.logCaptchaFailure(ip, email);
      throw e;
    }

    await this.security.assertAuthAllowed(ip, email);

    const user = await this.prisma.user.findUnique({ where: { email } });
    const message = 'If an account exists for that email, a reset link has been sent.';

    if (!user || user.role === 'ADMIN') {
      return { message };
    }

    await this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    const adminUrl = (this.config.get('ADMIN_APP_URL') || 'http://localhost:3000').replace(/\/$/, '');
    const resetUrl = `${adminUrl}/app/reset-password?token=${token}`;
    await this.email.sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });

    return { message };
  }

  async resetPassword(token: string, password: string, captchaToken: string | undefined, ip: string) {
    try {
      await this.security.verifyCaptchaForAuth(captchaToken, ip);
    } catch (e) {
      await this.security.logCaptchaFailure(ip);
      throw e;
    }

    const record = await this.prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset link. Please request a new one.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: record.userId } });
    if (!user || user.role === 'ADMIN') {
      throw new BadRequestException('Invalid or expired reset link. Please request a new one.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
      }),
      this.prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
    ]);

    return { message: 'Password updated. You can sign in with your new password.' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        businessName: true,
        businessLogo: true,
        businessPhone: true,
        businessEmail: true,
        businessAddress: true,
        taxId: true,
        currency: true,
        language: true,
        timezone: true,
        plan: true,
        planExpiresAt: true,
        settings: true,
        createdAt: true,
      },
    });
    if (!user || user.role === 'ADMIN') {
      throw new ForbiddenException('User profile not available');
    }
    return user;
  }

  signAppToken(userId: string, email: string, role: string) {
    return this.jwt.sign({ sub: userId, email, role, aud: 'app' });
  }

  signAdminToken(userId: string, email: string) {
    return this.jwt.sign({ sub: userId, email, role: 'ADMIN', aud: 'admin' });
  }
}
