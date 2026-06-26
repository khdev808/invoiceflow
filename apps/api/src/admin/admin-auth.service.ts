import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { AuthService } from '../auth/auth.service';
import { AdminLoginDto } from './dto/admin-auth.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    private prisma: PrismaService,
    private security: SecurityService,
    private auth: AuthService,
  ) {}

  async login(dto: AdminLoginDto, ip: string, userAgent: string) {
    try {
      await this.security.verifyCaptchaForAuth(dto.captchaToken, ip);
    } catch (e) {
      await this.security.logCaptchaFailure(ip, dto.email);
      throw e;
    }

    await this.security.assertAuthAllowed(ip, dto.email);

    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user || user.role !== 'ADMIN') {
      await this.security.recordLoginFailure({
        email: dto.email,
        ip,
        userAgent,
        context: 'admin',
        userId: user?.id,
      });
      throw new UnauthorizedException('Invalid admin credentials');
    }

    await this.security.assertUserAllowed(user.id);

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.security.recordLoginFailure({
        email: dto.email,
        ip,
        userAgent,
        context: 'admin',
        userId: user.id,
      });
      throw new UnauthorizedException('Invalid admin credentials');
    }

    await this.security.recordLoginSuccess({
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
      context: 'admin',
    });

    const token = this.auth.signAdminToken(user.id, user.email);
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }
}
