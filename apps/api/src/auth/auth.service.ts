import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private email: EmailService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        businessName: dto.businessName,
        settings: { create: {} },
      },
      select: { id: true, email: true, name: true, role: true, businessName: true },
    });

    const token = this.signToken(user.id, user.email, user.role);
    return { user, token };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.signToken(user.id, user.email, user.role);
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

  async forgotPassword(email: string) {
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

  async resetPassword(token: string, password: string) {
    const record = await this.prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset link. Please request a new one.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
    ]);

    return { message: 'Password updated. You can sign in with your new password.' };
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
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
  }

  private signToken(userId: string, email: string, role: string) {
    return this.jwt.sign({ sub: userId, email, role });
  }
}
