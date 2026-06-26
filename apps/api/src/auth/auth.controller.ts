import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { AppUserGuard } from './guards';
import { getClientIp, getUserAgent } from '../security/security.utils';

function getMobileAppKey(req: Request): string | undefined {
  const raw = req.headers['x-invoiceflow-app-key'];
  return typeof raw === 'string' ? raw : undefined;
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.auth.register(dto, getClientIp(req), getUserAgent(req), getMobileAppKey(req));
  }

  @Post('login')
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.auth.login(dto, getClientIp(req), getUserAgent(req), getMobileAppKey(req));
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    return this.auth.forgotPassword(dto.email, dto.captchaToken, getClientIp(req));
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    return this.auth.resetPassword(dto.token, dto.password, dto.captchaToken, getClientIp(req));
  }

  @UseGuards(AppUserGuard)
  @Get('me')
  me(@Req() req: { user: { userId: string } }) {
    return this.auth.getProfile(req.user.userId);
  }
}
